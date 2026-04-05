import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <SafeAreaView style={styles.container}>
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaView>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
});
