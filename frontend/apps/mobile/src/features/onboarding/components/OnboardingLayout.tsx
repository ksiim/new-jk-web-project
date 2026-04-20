import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../../shared/theme/colors';

type Props = {
  title: string;
  step?: { current: number; total: number };
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onSkip?: () => void;
};

export function OnboardingLayout({
  title,
  step,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.content}>{children}</View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text style={styles.skip}>Пропустить</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}

        {step ? (
          <Text style={styles.step}>
            {step.current}/{step.total}
          </Text>
        ) : (
          <View style={styles.stepPlaceholder} />
        )}

        <Pressable
          onPress={onPrimary}
          disabled={primaryDisabled}
          style={[styles.cta, primaryDisabled && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>{primaryLabel}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 32,
    marginBottom: 28,
  },
  content: {
    gap: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
  },
  skip: {
    color: colors.textMuted,
    fontSize: 14,
  },
  skipPlaceholder: {
    width: 80,
  },
  step: {
    fontSize: 13,
    color: colors.textMuted,
  },
  stepPlaceholder: {
    width: 32,
  },
  cta: {
    backgroundColor: colors.welcomeCta,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
