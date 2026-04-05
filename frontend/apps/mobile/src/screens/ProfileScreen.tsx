import { StyleSheet, Text, View } from 'react-native';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>User/Guide profile will be implemented in Week 2.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  text: { marginTop: 8, fontSize: 14, color: '#4b5563' },
});

