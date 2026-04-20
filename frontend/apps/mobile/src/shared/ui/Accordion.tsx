import { Feather } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  title: string;
  defaultOpen?: boolean;
  children?: ReactNode;
  /** Что показать, если контент пустой. */
  emptyLabel?: string;
};

export function Accordion({ title, defaultOpen, children, emptyLabel }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.textPrimary}
        />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {children ?? (
            <Text style={styles.empty}>{emptyLabel ?? 'Пока пусто'}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    paddingTop: 4,
  },
  empty: {
    paddingVertical: 16,
    color: colors.textMuted,
    fontSize: 14,
  },
});
