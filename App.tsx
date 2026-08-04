/**
 * Vibe — Free Worldwide Music Player
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BaseColors } from './src/theme/colors';
import AppNavigator from './src/navigation/AppNavigator';
import PlayerBar from './src/components/player/PlayerBar';
import { ensureTrackPlayer } from './src/store/playerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      retry: 2,
    },
  },
});

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: BaseColors.bg0,
    card: BaseColors.bg0,
    text: BaseColors.text1,
    border: BaseColors.border,
    primary: '#FFFFFF',
  },
};

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureTrackPlayer()
      .then(() => mounted && setReady(true))
      .catch(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.flex}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={navTheme}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            {ready ? <AppShell /> : <BootLoader />}
          </NavigationContainer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const AppShell: React.FC = () => (
  <View style={styles.flex}>
    <AppNavigator />
    <PlayerBar />
  </View>
);

const BootLoader: React.FC = () => (
  <View style={[styles.flex, styles.center]}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BaseColors.bg0 },
  center: { alignItems: 'center', justifyContent: 'center' },
});

export default App;