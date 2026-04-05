import { StyleSheet, Text, View } from 'react-native';

export function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.text}>Map SDK + POE markers will be implemented in Week 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  text: { marginTop: 8, fontSize: 14, color: '#4b5563' },
});

