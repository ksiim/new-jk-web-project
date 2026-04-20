import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { OnboardingLayout } from '../../features/onboarding/components/OnboardingLayout';
import {
  type InterestId,
  usePreferencesStore,
} from '../../entities/preferences/preferencesStore';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingInterests'>;

const interests: Array<{
  id: InterestId;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { id: 'art', label: 'Искусство', icon: 'feather' },
  { id: 'coffee', label: 'Кофе', icon: 'coffee' },
  { id: 'history', label: 'История', icon: 'book-open' },
  { id: 'nature', label: 'Природа', icon: 'sun' },
  { id: 'music', label: 'Музыка', icon: 'music' },
  { id: 'relax', label: 'Спокойный отдых', icon: 'heart' },
];

export function OnboardingInterestsScreen({ navigation }: Props) {
  const selected = usePreferencesStore((s) => s.interests);
  const toggle = usePreferencesStore((s) => s.toggleInterest);
  const markCompleted = usePreferencesStore((s) => s.markCompleted);

  const goNext = () => navigation.navigate('OnboardingAccessibility');

  const skipAll = () => {
    markCompleted();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <OnboardingLayout
      title="Что вам интересно?"
      step={{ current: 1, total: 3 }}
      primaryLabel="Далее"
      onPrimary={goNext}
      onSkip={skipAll}
    >
      <View style={styles.grid}>
        {interests.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              style={[styles.tile, isSelected && styles.tileSelected]}
            >
              <Feather
                name={item.icon}
                size={26}
                color={colors.white}
                style={styles.tileIcon}
              />
              <Text style={styles.tileLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.accent,
    opacity: 0.85,
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
  },
  tileSelected: {
    opacity: 1,
    backgroundColor: colors.accentDark,
  },
  tileIcon: {
    marginBottom: 8,
  },
  tileLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
