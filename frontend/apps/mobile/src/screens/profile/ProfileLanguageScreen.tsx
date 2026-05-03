import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  LANGUAGE_LABELS,
  type LanguageId,
  useSettingsStore,
} from '../../entities/settings/settingsStore';
import { useT } from '../../shared/i18n/useT';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { colors } from '../../shared/theme/colors';

const languageOrder: LanguageId[] = ['en', 'be', 'kk', 'zh', 'ru'];

export function ProfileLanguageScreen() {
  const { t } = useT();
  const navigation = useNavigation();
  const current = useSettingsStore((s) => s.language);
  const commit = useSettingsStore((s) => s.setLanguage);
  const [selected, setSelected] = useState<LanguageId>(current);

  useEffect(() => {
    setSelected(current);
  }, [current]);

  const handleSave = () => {
    commit(selected);
    navigation.goBack();
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader label={t('common.back')} />
        <Text style={styles.title}>{t('language.title')}</Text>

        <View style={styles.list}>
          {languageOrder.map((id) => {
            const active = selected === id;
            return (
              <Pressable
                key={id}
                onPress={() => setSelected(id)}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>{LANGUAGE_LABELS[id]}</Text>
                {active ? (
                  <Feather
                    name="check"
                    size={20}
                    color={colors.textPrimary}
                    style={styles.check}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton title={t('common.save')} onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 18,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  check: {
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
});
