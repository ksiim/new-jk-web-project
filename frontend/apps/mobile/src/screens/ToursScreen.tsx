import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../shared/theme/colors';

export function ToursScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Туры</Text>
      <Text style={styles.text}>Каталог и карточки тура будут реализованы на неделе 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  text: { marginTop: 8, fontSize: 16, color: colors.textMuted },
});

