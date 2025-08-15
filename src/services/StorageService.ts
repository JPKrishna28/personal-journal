import { Platform } from 'react-native';
import { JournalEntry, JournalEntryData, Attachment } from '../types/types';

// Import native modules conditionally
let FileSystem: any = null;
let Sharing: any = null;

if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
}

const JOURNAL_STORAGE_KEY = 'JournalApp_Entries';

// Web storage implementation using localStorage
class WebStorageService {
  static saveEntries(entries: JournalEntry[]): void {
    const entriesData = entries.map(entry => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entriesData));
  }

  static loadEntries(): JournalEntry[] {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!stored) return [];

    try {
      const entriesData: JournalEntryData[] = JSON.parse(stored);
      return entriesData.map(data => ({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }));
    } catch (error) {
      console.error('Error parsing stored entries:', error);
      return [];
    }
  }

  static saveAttachment(entryId: string, attachment: Attachment, dataUri: string): Promise<string> {
    // Store attachment data in localStorage with a key
    const attachmentKey = `attachment_${entryId}_${attachment.id}`;
    localStorage.setItem(attachmentKey, dataUri);
    return Promise.resolve(attachmentKey);
  }

  static getAttachmentUri(entryId: string, attachmentId: string): string {
    const attachmentKey = `attachment_${entryId}_${attachmentId}`;
    return localStorage.getItem(attachmentKey) || '';
  }

  static deleteEntry(entryId: string): void {
    const entries = this.loadEntries();
    const entryToDelete = entries.find(e => e.id === entryId);
    
    if (entryToDelete) {
      // Delete attachment data
      entryToDelete.attachments.forEach(attachment => {
        const attachmentKey = `attachment_${entryId}_${attachment.id}`;
        localStorage.removeItem(attachmentKey);
      });
      
      // Save entries without the deleted one
      const updatedEntries = entries.filter(e => e.id !== entryId);
      this.saveEntries(updatedEntries);
    }
  }
}

// Native storage implementation using expo-file-system
class NativeStorageService {
  static JOURNAL_DIR = FileSystem ? `${FileSystem.documentDirectory}JournalApp/` : '';

  static async initializeStorage(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.JOURNAL_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.JOURNAL_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }
}

export class JournalStorageService {
  
  static async initializeStorage(): Promise<void> {
    if (Platform.OS === 'web') {
      // Web doesn't need initialization
      return Promise.resolve();
    } else {
      return NativeStorageService.initializeStorage();
    }
  }

  static async saveEntry(entry: JournalEntry): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, we load all entries, update/add the entry, and save back
      const entries = WebStorageService.loadEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      WebStorageService.saveEntries(entries);
      return Promise.resolve();
    } else {
      return this.saveEntryNative(entry);
    }
  }

  static async saveEntryNative(entry: JournalEntry): Promise<void> {
    try {
      await this.initializeStorage();
      
      // Create entry directory
      const entryDir = `${NativeStorageService.JOURNAL_DIR}${this.formatEntryFolderName(entry.createdAt, entry.id)}/`;
      await FileSystem.makeDirectoryAsync(entryDir, { intermediates: true });

      // Save entry data as JSON
      const entryData: JournalEntryData = {
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      };

      const jsonPath = `${entryDir}entry.json`;
      await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(entryData, null, 2));

      console.log('Entry saved successfully:', entryDir);
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  }

  static async loadEntry(entryId: string): Promise<JournalEntry | null> {
    const entries = await this.loadAllEntries();
    return entries.find(entry => entry.id === entryId) || null;
  }

  static async loadAllEntries(): Promise<JournalEntry[]> {
    if (Platform.OS === 'web') {
      return Promise.resolve(WebStorageService.loadEntries());
    } else {
      return this.loadAllEntriesNative();
    }
  }

  static async loadAllEntriesNative(): Promise<JournalEntry[]> {
    try {
      await this.initializeStorage();
      
      const dirContents = await FileSystem.readDirectoryAsync(NativeStorageService.JOURNAL_DIR);
      const entries: JournalEntry[] = [];

      for (const folderName of dirContents) {
        const entryDir = `${NativeStorageService.JOURNAL_DIR}${folderName}/`;
        const jsonPath = `${entryDir}entry.json`;
        
        try {
          const jsonContent = await FileSystem.readAsStringAsync(jsonPath);
          const entryData: JournalEntryData = JSON.parse(jsonContent);
          
          const entry: JournalEntry = {
            ...entryData,
            createdAt: new Date(entryData.createdAt),
            updatedAt: new Date(entryData.updatedAt),
          };
          
          entries.push(entry);
        } catch (entryError) {
          console.warn(`Error loading entry from ${folderName}:`, entryError);
        }
      }

      return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error loading all entries:', error);
      return [];
    }
  }

  static async deleteEntry(entryId: string): Promise<void> {
    if (Platform.OS === 'web') {
      WebStorageService.deleteEntry(entryId);
      return Promise.resolve();
    } else {
      return this.deleteEntryNative(entryId);
    }
  }

  static async deleteEntryNative(entryId: string): Promise<void> {
    try {
      await this.initializeStorage();
      
      const entries = await this.loadAllEntriesNative();
      const entry = entries.find(e => e.id === entryId);
      
      if (entry) {
        const entryDir = `${NativeStorageService.JOURNAL_DIR}${this.formatEntryFolderName(entry.createdAt, entry.id)}/`;
        await FileSystem.deleteAsync(entryDir, { idempotent: true });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  static async saveAttachment(entryId: string, createdAt: Date, attachment: Attachment, sourceUri: string): Promise<string> {
    if (Platform.OS === 'web') {
      // For web, we store the data URI directly
      return WebStorageService.saveAttachment(entryId, attachment, sourceUri);
    } else {
      return this.saveAttachmentNative(entryId, createdAt, attachment, sourceUri);
    }
  }

  static async saveAttachmentNative(entryId: string, createdAt: Date, attachment: Attachment, sourceUri: string): Promise<string> {
    try {
      const entryDir = `${NativeStorageService.JOURNAL_DIR}${this.formatEntryFolderName(createdAt, entryId)}/`;
      const destPath = `${entryDir}${attachment.fileName}`;
      
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destPath,
      });

      return destPath;
    } catch (error) {
      console.error('Error saving attachment:', error);
      throw error;
    }
  }

  static async searchEntries(query: string): Promise<JournalEntry[]> {
    try {
      const allEntries = await this.loadAllEntries();
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) {
        return allEntries;
      }

      return allEntries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }

  static async exportEntry(entryId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return this.exportEntryWeb(entryId);
    } else {
      return this.exportEntryNative(entryId);
    }
  }

  static async exportEntryWeb(entryId: string): Promise<void> {
    try {
      const entry = await this.loadEntry(entryId);
      if (!entry) {
        throw new Error('Entry not found');
      }

      const exportData = {
        entry,
        attachments: entry.attachments.map(attachment => ({
          ...attachment,
          data: WebStorageService.getAttachmentUri(entryId, attachment.id)
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal-entry-${entry.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting entry:', error);
      throw error;
    }
  }

  static async exportEntryNative(entryId: string): Promise<void> {
    try {
      const entries = await this.loadAllEntriesNative();
      const entry = entries.find(e => e.id === entryId);
      
      if (!entry) {
        throw new Error('Entry not found');
      }

      const entryDir = `${NativeStorageService.JOURNAL_DIR}${this.formatEntryFolderName(entry.createdAt, entry.id)}/`;
      
      if (Sharing && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(entryDir, {
          mimeType: 'application/zip',
          dialogTitle: `Export Journal Entry: ${entry.title}`,
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting entry:', error);
      throw error;
    }
  }

  private static formatEntryFolderName(createdAt: Date, entryId: string): string {
    const dateStr = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = createdAt.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${dateStr}_${timeStr}_${entryId.slice(0, 8)}`;
  }

  static getEntryDirectory(entryId: string, createdAt: Date): string {
    if (Platform.OS === 'web') {
      return `web-storage-${entryId}`;
    } else {
      return `${NativeStorageService.JOURNAL_DIR}${this.formatEntryFolderName(createdAt, entryId)}/`;
    }
  }

  static getAttachmentUri(entryId: string, attachmentId: string): string {
    if (Platform.OS === 'web') {
      return WebStorageService.getAttachmentUri(entryId, attachmentId);
    } else {
      // For native, return the file path (this would need to be constructed based on the entry)
      return '';
    }
  }
}
