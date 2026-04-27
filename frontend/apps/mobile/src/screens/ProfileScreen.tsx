import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../shared/theme/colors';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      <Text style={styles.text}>Данные пользователя и гида будут расширяться в следующих итерациях.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  text: { marginTop: 8, fontSize: 16, color: colors.textMuted },
});

