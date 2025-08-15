import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { 
  Text, 
  Title, 
  Card, 
  IconButton, 
  useTheme, 
  Button,
  Dialog,
  Portal,
  Menu,
  Divider
} from 'react-native-paper';
import { Audio } from 'expo-av';
import { Video } from 'expo-av';
import { JournalEntry, Attachment } from '../types/types';
import { JournalStorageService } from '../services/StorageService';
import { formatDate, formatDuration } from '../utils/helpers';

type ViewEntryScreenProps = {
  navigation: any;
  route: {
    params: {
      entryId: string;
    };
  };
};

export default function ViewEntryScreen({ navigation, route }: ViewEntryScreenProps) {
  const theme = useTheme();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadEntry();
    
    // Set up header right button
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('CreateEntry', { entryId });
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              exportEntry();
            }}
            title="Export"
            leadingIcon="export"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setDeleteDialogVisible(true);
            }}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      ),
    });

    return () => {
      if (playingAudio) {
        playingAudio.unloadAsync();
      }
    };
  }, [menuVisible, playingAudio]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const loadedEntry = await JournalStorageService.loadEntry(entryId);
      setEntry(loadedEntry);
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async () => {
    try {
      await JournalStorageService.deleteEntry(entryId);
      Alert.alert('Deleted', 'Entry deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const exportEntry = async () => {
    try {
      await JournalStorageService.exportEntry(entryId);
    } catch (error) {
      console.error('Error exporting entry:', error);
      Alert.alert('Error', 'Failed to export entry');
    }
  };

  const playAudio = async (uri: string) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        await playingAudio.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingAudio(sound);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setPlayingAudio(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <Card key={attachment.id} style={styles.attachmentCard}>
            <Image
              source={{ uri: attachment.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </Card>
        );

      case 'audio':
        return (
          <Card key={attachment.id} style={styles.attachmentCard}>
            <Card.Content style={styles.audioContainer}>
              <IconButton
                icon="play"
                onPress={() => playAudio(attachment.uri)}
                mode="contained-tonal"
              />
              <Text>Audio Recording</Text>
              {attachment.duration && (
                <Text style={styles.duration}>
                  {formatDuration(attachment.duration)}
                </Text>
              )}
            </Card.Content>
          </Card>
        );

      case 'video':
        return (
          <Card key={attachment.id} style={styles.attachmentCard}>
            <Video
              source={{ uri: attachment.uri }}
              style={styles.video}
              useNativeControls
              shouldPlay={false}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Entry not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <Card style={styles.entryCard}>
          <Card.Content>
            <Title style={styles.title}>{entry.title || 'Untitled Entry'}</Title>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              Created: {formatDate(entry.createdAt)}
            </Text>
            {entry.updatedAt.getTime() !== entry.createdAt.getTime() && (
              <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                Updated: {formatDate(entry.updatedAt)}
              </Text>
            )}
            <Divider style={styles.divider} />
            <Text style={styles.contentText}>{entry.content || 'No content'}</Text>
          </Card.Content>
        </Card>

        {entry.attachments.length > 0 && (
          <Card style={styles.attachmentsCard}>
            <Card.Content>
              <Title>Attachments</Title>
              <View style={styles.attachmentsList}>
                {entry.attachments.map(renderAttachment)}
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Entry</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this entry? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={deleteEntry} textColor={theme.colors.error}>Delete</Button>
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  entryCard: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  attachmentsCard: {
    marginBottom: 16,
  },
  attachmentsList: {
    marginTop: 16,
  },
  attachmentCard: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
  },
  video: {
    width: '100%',
    height: 200,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  duration: {
    marginLeft: 'auto',
    fontSize: 12,
  },
});
