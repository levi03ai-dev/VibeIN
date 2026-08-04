import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ArtistScreen from '../screens/ArtistScreen';
import AlbumScreen from '../screens/AlbumScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import MoodScreen from '../screens/MoodScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      contentStyle: { backgroundColor: '#080808' },
    }}
  >
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="Artist" component={ArtistScreen} />
    <Stack.Screen name="Album" component={AlbumScreen} />
    <Stack.Screen name="Playlist" component={PlaylistScreen} />
    <Stack.Screen name="Mood" component={MoodScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
