import { StyleSheet, Text, View } from 'react-native';

export function ToursScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tours</Text>
      <Text style={styles.text}>Tours catalog will be implemented in Week 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  text: { marginTop: 8, fontSize: 14, color: '#4b5563' },
});

