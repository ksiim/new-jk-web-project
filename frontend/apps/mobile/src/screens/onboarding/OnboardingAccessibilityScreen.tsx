import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { OnboardingLayout } from '../../features/onboarding/components/OnboardingLayout';
import {
  type AccessibilityId,
  usePreferencesStore,
} from '../../entities/preferences/preferencesStore';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'OnboardingAccessibility'
>;

const options: Array<{ id: AccessibilityId; label: string }> = [
  { id: 'wheelchair', label: 'Передвигаюсь с коляской' },
  { id: 'cane', label: 'Использую трость' },
  { id: 'ramps', label: 'Нужны пандусы' },
  { id: 'avoid_stairs', label: 'Избегать лестниц' },
  { id: 'hearing', label: 'Проблемы со слухом' },
  { id: 'none', label: 'Нет ограничений' },
];

export function OnboardingAccessibilityScreen({ navigation }: Props) {
  const selected = usePreferencesStore((s) => s.accessibility);
  const toggle = usePreferencesStore((s) => s.toggleAccessibility);
  const markCompleted = usePreferencesStore((s) => s.markCompleted);

  const goNext = () => navigation.navigate('OnboardingStyle');

  const skipAll = () => {
    markCompleted();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <OnboardingLayout
      title="Есть ли особенности, которые нам важно учесть?"
      step={{ current: 2, total: 3 }}
      primaryLabel="Далее"
      onPrimary={goNext}
      onSkip={skipAll}
    >
      <View style={styles.list}>
        {options.map((item) => {
          const isChecked = selected.includes(item.id);
          return (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => toggle(item.id)}
            >
              <View style={[styles.box, isChecked && styles.boxChecked]}>
                {isChecked ? (
                  <Feather name="check" size={16} color={colors.textPrimary} />
                ) : null}
              </View>
              <Text style={styles.rowLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boxChecked: {
    backgroundColor: colors.white,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});
