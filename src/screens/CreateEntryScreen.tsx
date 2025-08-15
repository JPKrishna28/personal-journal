import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  IconButton, 
  useTheme, 
  Chip,
  Text,
  Dialog,
  Portal
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { JournalEntry, Attachment } from '../types/types';
import { JournalStorageService } from '../services/StorageService';
import { generateUUID, generateFileName, formatDuration } from '../utils/helpers';

type CreateEntryScreenProps = {
  navigation: any;
  route: {
    params: {
      entryId?: string;
    };
  };
};

export default function CreateEntryScreen({ navigation, route }: CreateEntryScreenProps) {
  const theme = useTheme();
  const { entryId } = route.params || {};
  const isEditing = !!entryId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setSaving] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadEntry();
    }
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
      await Audio.requestPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
    }
  };

  const loadEntry = async () => {
    if (!entryId) return;
    
    try {
      const entry = await JournalStorageService.loadEntry(entryId);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setAttachments(entry.attachments);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry');
    }
  };

  const saveEntry = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Entry', 'Please add a title or content before saving.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const entry: JournalEntry = {
        id: entryId || generateUUID(),
        title: title.trim(),
        content: content.trim(),
        createdAt: isEditing ? (await JournalStorageService.loadEntry(entryId!))?.createdAt || now : now,
        updatedAt: now,
        attachments,
      };

      await JournalStorageService.saveEntry(entry);
      Alert.alert('Success', 'Entry saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addAttachment('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
    setShowMediaDialog(false);
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        // On web, camera access is limited, so we'll just use file picker
        Alert.alert('Camera not available', 'Please use "Choose from Gallery" on web');
        setShowMediaDialog(false);
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addAttachment('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
    setShowMediaDialog(false);
  };

  const pickVideo = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Video picker not available', 'Video selection is limited on web');
        setShowMediaDialog(false);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addAttachment('video', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
    setShowMediaDialog(false);
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Audio recording not available', 'Audio recording is not supported on web');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        await addAttachment('audio', uri);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const addAttachment = async (type: 'image' | 'audio' | 'video', sourceUri: string) => {
    try {
      const attachment: Attachment = {
        id: generateUUID(),
        type,
        fileName: generateFileName(type),
        uri: sourceUri,
      };

      // If we're editing an entry, save the attachment file
      if (entryId) {
        const entry = await JournalStorageService.loadEntry(entryId);
        if (entry) {
          const savedPath = await JournalStorageService.saveAttachment(
            entryId, 
            entry.createdAt, 
            attachment, 
            sourceUri
          );
          attachment.uri = savedPath;
        }
      }

      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
      console.error('Error adding attachment:', error);
      Alert.alert('Error', 'Failed to add attachment');
    }
  };

  const removeAttachment = (attachmentId: string) => {
    Alert.alert(
      'Remove Attachment',
      'Are you sure you want to remove this attachment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
          }
        }
      ]
    );
  };

  const renderAttachment = (attachment: Attachment) => (
    <Chip
      key={attachment.id}
      mode="outlined"
      onClose={() => removeAttachment(attachment.id)}
      icon={
        attachment.type === 'image' ? 'image' :
        attachment.type === 'audio' ? 'microphone' : 'video'
      }
      style={styles.attachmentChip}
    >
      {attachment.type === 'audio' && attachment.duration 
        ? `Audio (${formatDuration(attachment.duration)})`
        : attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)
      }
    </Chip>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.titleInput}
        />

        <TextInput
          label="Content"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={10}
          style={styles.contentInput}
        />

        <Card style={styles.attachmentCard}>
          <Card.Content>
            <View style={styles.attachmentHeader}>
              <Title>Attachments</Title>
              <View style={styles.attachmentButtons}>
                <IconButton
                  icon="attachment"
                  onPress={() => setShowMediaDialog(true)}
                  mode="contained-tonal"
                />
                <IconButton
                  icon={isRecording ? "stop" : "microphone"}
                  onPress={isRecording ? stopRecording : startRecording}
                  mode="contained-tonal"
                  iconColor={isRecording ? theme.colors.error : theme.colors.primary}
                  disabled={Platform.OS === 'web'}
                />
              </View>
            </View>
            
            {isRecording && (
              <Text style={[styles.recordingText, { color: theme.colors.error }]}>
                Recording... Tap stop to finish
              </Text>
            )}

            <View style={styles.attachmentList}>
              {attachments.map(renderAttachment)}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={saveEntry}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          {isEditing ? 'Update Entry' : 'Save Entry'}
        </Button>
      </View>

      <Portal>
        <Dialog visible={showMediaDialog} onDismiss={() => setShowMediaDialog(false)}>
          <Dialog.Title>Add Media</Dialog.Title>
          <Dialog.Content>
            {Platform.OS !== 'web' && (
              <Button onPress={takePhoto} style={styles.dialogButton}>
                Take Photo
              </Button>
            )}
            <Button onPress={pickImage} style={styles.dialogButton}>
              Choose from Gallery
            </Button>
            {Platform.OS !== 'web' && (
              <Button onPress={pickVideo} style={styles.dialogButton}>
                Choose Video
              </Button>
            )}
            {Platform.OS === 'web' && (
              <Text style={styles.webNotice}>
                Note: Camera and video features are not available on web
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMediaDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
  },
  contentInput: {
    marginBottom: 16,
  },
  attachmentCard: {
    marginBottom: 16,
  },
  attachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachmentButtons: {
    flexDirection: 'row',
  },
  recordingText: {
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  attachmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentChip: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  dialogButton: {
    marginBottom: 8,
  },
  webNotice: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
