import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  type NotificationKey,
  type NotificationSettings,
  useSettingsStore,
} from '../../entities/settings/settingsStore';
import { Accordion } from '../../shared/ui/Accordion';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { Toggle } from '../../shared/ui/Toggle';
import { colors } from '../../shared/theme/colors';

const rows: { key: NotificationKey; label: string }[] = [
  { key: 'promos', label: 'Получение рекламных рассылок' },
  { key: 'reminders', label: 'Получение напоминаний о записях' },
  { key: 'route', label: 'Строка маршрута' },
];

export function ProfileNotificationsScreen() {
  const navigation = useNavigation();
  const initial = useSettingsStore((s) => s.notifications);
  const commit = useSettingsStore((s) => s.toggleNotification);
  const [local, setLocal] = useState<NotificationSettings>(initial);

  const toggle = (key: NotificationKey) => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    (Object.keys(local) as NotificationKey[]).forEach((k) => {
      if (local[k] !== initial[k]) commit(k);
    });
    navigation.goBack();
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader />
        <Text style={styles.title}>Уведомления</Text>

        <View style={styles.rows}>
          {rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Toggle
                value={local[row.key]}
                onValueChange={() => toggle(row.key)}
              />
            </View>
          ))}
        </View>

        <Accordion title="История" emptyLabel="История уведомлений пока пуста" />
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton onPress={handleSave} />
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 18,
  },
  rows: {
    gap: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingRight: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
});
