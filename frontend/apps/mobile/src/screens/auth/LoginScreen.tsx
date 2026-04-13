import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../entities/auth/authStore';
import { AuthPrimaryButton } from '../../features/auth/components/AuthPrimaryButton';
import { LogoMark } from '../../features/auth/components/LogoMark';
import {
  type LoginFormValues,
  loginSchema,
} from '../../features/auth/schemas/loginSchema';
import { UnderlineField } from '../../features/auth/components/UnderlineField';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const trimmed = values.identifier.trim();
      const isEmail = trimmed.includes('@');
      login({
        id: 'local-mock',
        email: isEmail ? trimmed : `${trimmed.replace(/\D/g, '')}@phone.local`,
        name: 'Пользователь',
        phone: isEmail ? undefined : trimmed,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <LogoMark size={52} />
          <Text style={styles.title}>С возвращением!</Text>
        </View>

        <UnderlineField
          control={control}
          name="identifier"
          label="Email / Номер телефона"
          keyboardType="default"
          autoCapitalize="none"
        />
        <UnderlineField
          control={control}
          name="password"
          label="Пароль"
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          onPress={() => Alert.alert('Скоро', 'Восстановление пароля появится в следующей итерации.')}
        >
          <Text style={styles.forgot}>Забыли пароль?</Text>
        </Pressable>

        <AuthPrimaryButton title="Войти" onPress={onSubmit} loading={submitting} />

        <Text style={styles.footer}>
          Еще нет аккаунта?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Регистрация
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  top: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  forgot: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
