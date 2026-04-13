import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../shared/theme/colors';

export function MapFiltersScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.fieldLabel}>Интересы:</Text>
      <View style={styles.fieldPlaceholder} />

      <Text style={styles.fieldLabel}>Доступность:</Text>
      <View style={styles.fieldPlaceholder} />

      <Text style={styles.fieldLabel}>Дистанция:</Text>
      <View style={styles.fieldPlaceholder} />

      <Pressable style={styles.applyButton}>
        <Text style={styles.applyText}>Применить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '700',
    marginTop: 20,
  },
  fieldPlaceholder: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  applyButton: {
    marginTop: 'auto',
    marginBottom: 30,
    alignSelf: 'center',
    backgroundColor: colors.accentButton,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minWidth: 150,
    alignItems: 'center',
  },
  applyText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
});

