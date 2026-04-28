import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePoeFiltersStore } from '../../entities/poe/poeUiStore';
import { colors } from '../../shared/theme/colors';
import { SaveButton } from '../../shared/ui/SaveButton';
import { Toggle } from '../../shared/ui/Toggle';

export function MapFiltersScreen() {
  const navigation = useNavigation();
  const category = usePoeFiltersStore((s) => s.category);
  const wheelchairOnly = usePoeFiltersStore((s) => s.wheelchairOnly);
  const avoidStairs = usePoeFiltersStore((s) => s.avoidStairs);
  const radiusMeters = usePoeFiltersStore((s) => s.radiusMeters);
  const setCategory = usePoeFiltersStore((s) => s.setCategory);
  const setWheelchairOnly = usePoeFiltersStore((s) => s.setWheelchairOnly);
  const setAvoidStairs = usePoeFiltersStore((s) => s.setAvoidStairs);
  const setRadiusMeters = usePoeFiltersStore((s) => s.setRadiusMeters);
  const resetFilters = usePoeFiltersStore((s) => s.resetFilters);

  const [radiusInput, setRadiusInput] = useState(
    radiusMeters ? String(radiusMeters) : '',
  );

  const radiusError = useMemo(() => {
    if (!radiusInput.trim()) return null;
    const n = Number(radiusInput);
    if (Number.isNaN(n) || n < 100) return 'Введите число от 100';
    if (n > 10000) return 'Максимум 10000 м';
    return null;
  }, [radiusInput]);

  const apply = () => {
    if (radiusError) return;
    const nextRadius = radiusInput.trim() ? Number(radiusInput) : null;
    setRadiusMeters(nextRadius);
    navigation.goBack();
  };

  const categories = [
    { id: null, label: 'Все' },
    { id: 'art', label: 'Искусство' },
    { id: 'coffee', label: 'Кофе' },
    { id: 'history', label: 'История' },
    { id: 'nature', label: 'Природа' },
    { id: 'music', label: 'Музыка' },
  ] as const;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Категория</Text>
        <View style={styles.chipsWrap}>
          {categories.map((item) => {
            const active = category === item.id;
            return (
              <Pressable
                key={String(item.id)}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(item.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Доступность</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Передвижение на коляске</Text>
          <Toggle value={wheelchairOnly} onValueChange={setWheelchairOnly} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Избегать лестниц</Text>
          <Toggle value={avoidStairs} onValueChange={setAvoidStairs} />
        </View>

        <Text style={styles.sectionTitle}>Радиус (метры)</Text>
        <TextInput
          style={styles.radiusInput}
          value={radiusInput}
          onChangeText={setRadiusInput}
          keyboardType="number-pad"
          placeholder="Например: 2000"
          placeholderTextColor={colors.textMuted}
        />
        {radiusError ? <Text style={styles.errorText}>{radiusError}</Text> : null}

        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            resetFilters();
            setRadiusInput('');
          }}
        >
          <Text style={styles.resetText}>Сбросить фильтры</Text>
        </Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <SaveButton title="Применить" onPress={apply} disabled={Boolean(radiusError)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.accentButton,
    backgroundColor: colors.accentButton,
  },
  chipText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  rowLabel: {
    flex: 1,
    paddingRight: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  radiusInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  errorText: {
    marginTop: 4,
    color: colors.errorText,
    fontSize: 12,
  },
  resetBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  resetText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
  },
});

