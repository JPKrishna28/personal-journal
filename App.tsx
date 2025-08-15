import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { MaterialCommunityIconProvider } from './src/config/iconProvider';

import HomeScreen from './src/screens/HomeScreen';
import CreateEntryScreen from './src/screens/CreateEntryScreen';
import ViewEntryScreen from './src/screens/ViewEntryScreen';
import SearchScreen from './src/screens/SearchScreen';
import { lightTheme, darkTheme } from './src/theme/theme';
import { useColorScheme } from 'react-native';

export type RootStackParamList = {
  Home: undefined;
  CreateEntry: { entryId?: string };
  ViewEntry: { entryId: string };
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Any app initialization code can go here
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider 
        theme={theme}
        settings={{
          icon: MaterialCommunityIconProvider
        }}
      >
        <NavigationContainer>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.surface,
              },
              headerTintColor: theme.colors.onSurface,
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Journal Entries' }}
            />
            <Stack.Screen 
              name="CreateEntry" 
              component={CreateEntryScreen} 
              options={{ title: 'New Entry' }}
            />
            <Stack.Screen 
              name="ViewEntry" 
              component={ViewEntryScreen} 
              options={{ title: 'Journal Entry' }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ title: 'Search Entries' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
