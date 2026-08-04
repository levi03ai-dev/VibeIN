import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../theme/colors';
import { usePlayerStore } from '../store/playerStore';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ChartsScreen from '../screens/ChartsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<string, [string, string]> = {
  Home: ['home-outline', 'home'],
  Search: ['search-outline', 'search'],
  Library: ['library-outline', 'library'],
  Charts: ['stats-chart-outline', 'stats-chart'],
  Settings: ['settings-outline', 'settings'],
};

const TabBar: React.FC = () => {
  const accent = usePlayerStore(s => s.accentColor);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: hexToRgba('#0A0A0A', 0.95),
          borderColor: BaseColors.border,
        },
      ]}
    />
  );
};

const TabNavigator: React.FC = () => {
  const accent = usePlayerStore(s => s.accentColor);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: hexToRgba('#0A0A0A', 0.96),
          borderTopColor: BaseColors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: BaseColors.text2,
        tabBarIcon: ({ focused, color, size }) => {
          const [outline, filled] = icons[route.name] ?? ['ellipse-outline', 'ellipse'];
          return (
            <Ionicons
              name={focused ? filled : outline}
              size={size}
              color={focused ? accent : color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default TabNavigator;
