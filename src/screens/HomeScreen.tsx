import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { FAB, Card, Title, Paragraph, IconButton, Text, useTheme, Searchbar } from 'react-native-paper';
import { JournalEntry } from '../types/types';
import { JournalStorageService } from '../services/StorageService';
import { formatDate } from '../utils/helpers';

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      const loadedEntries = await JournalStorageService.loadAllEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Load entries when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ViewEntry', { entryId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Title numberOfLines={1}>{item.title || 'Untitled Entry'}</Title>
            <Paragraph numberOfLines={2} style={styles.content}>
              {item.content || 'No content'}
            </Paragraph>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          {item.attachments.length > 0 && (
            <View style={styles.attachmentIndicator}>
              <IconButton
                icon="attachment"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text style={[styles.attachmentCount, { color: theme.colors.primary }]}>
                {item.attachments.length}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton
        icon="book-open-variant"
        size={64}
        iconColor={theme.colors.onSurfaceVariant}
      />
      <Title style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        No journal entries yet
      </Title>
      <Paragraph style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Tap the + button to create your first journal entry
      </Paragraph>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search entries..."
          value=""
          onChangeText={() => {}}
          onIconPress={() => navigation.navigate('Search')}
          onSubmitEditing={() => navigation.navigate('Search')}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateEntry', {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  content: {
    marginTop: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  attachmentIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentCount: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
