import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { 
  Searchbar, 
  Card, 
  Title, 
  Paragraph, 
  IconButton, 
  Text, 
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { JournalEntry } from '../types/types';
import { JournalStorageService } from '../services/StorageService';
import { formatDate } from '../utils/helpers';

type SearchScreenProps = {
  navigation: any;
};

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadAllEntries();
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchQuery, allEntries]);

  const loadAllEntries = async () => {
    try {
      const entries = await JournalStorageService.loadAllEntries();
      setAllEntries(entries);
      setSearchResults(entries); // Show all entries initially
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(allEntries);
      return;
    }

    setLoading(true);
    try {
      const results = await JournalStorageService.searchEntries(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ViewEntry', { entryId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Title numberOfLines={1}>{item.title || 'Untitled Entry'}</Title>
            <Paragraph numberOfLines={3} style={styles.content}>
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
        icon="magnify"
        size={64}
        iconColor={theme.colors.onSurfaceVariant}
      />
      <Title style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery.trim() ? 'No results found' : 'Search your journal entries'}
      </Title>
      <Paragraph style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery.trim() 
          ? 'Try a different search term'
          : 'Enter keywords to search through your entries'
        }
      </Paragraph>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search entries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          autoFocus
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={searchResults.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={EmptyState}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
});
