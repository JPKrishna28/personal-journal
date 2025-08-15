export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  fileName: string;
  uri: string;
  duration?: number; // for audio/video in seconds
}

export interface JournalEntryData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}
