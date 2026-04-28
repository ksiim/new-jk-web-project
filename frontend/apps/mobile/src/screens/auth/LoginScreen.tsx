import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { AuthPrimaryButton } from '../../features/auth/components/AuthPrimaryButton';
import { LogoMark } from '../../features/auth/components/LogoMark';
import {
  type LoginFormValues,
  loginSchema,
} from '../../features/auth/schemas/loginSchema';
import { UnderlineField } from '../../features/auth/components/UnderlineField';
import { extractApiError } from '../../shared/api/http';
import { useLogin } from '../../shared/auth/hooks';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function translateLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Нет соединения с сервером. Проверьте интернет.';
    }
    const status = error.response.status;
    if (status === 400 || status === 401 || status === 404) {
      return 'Неверный email или пароль';
    }
    if (status === 429) {
      return 'Слишком много попыток входа. Попробуйте позже.';
    }
    if (status >= 500) {
      return 'Сервер временно недоступен. Попробуйте позже.';
    }
  }
  return extractApiError(error);
}

export function LoginScreen({ navigation }: Props) {
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, setError, clearErrors, formState } =
    useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      mode: 'onChange',
      defaultValues: { email: '', password: '' },
    });

  const emailValue = useWatch({ control, name: 'email' });
  const passwordValue = useWatch({ control, name: 'password' });

  useEffect(() => {
    if (formError) {
      setFormError(null);
      clearErrors(['email', 'password']);
    }
  }, [emailValue, passwordValue, formError, clearErrors]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      const message = translateLoginError(error);
      setFormError(message);
      // Подсвечиваем оба поля красной линией без дублирования текста ошибки
      // (текст один раз показываем в общей плашке).
      setError('email', { type: 'server' });
      setError('password', { type: 'server' });
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
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <UnderlineField
          control={control}
          name="password"
          label="Пароль"
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Забыли пароль?</Text>
        </Pressable>

        {formError ? (
          <View style={styles.errorBox}>
            <Feather
              name="alert-circle"
              size={16}
              color={colors.errorText}
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <AuthPrimaryButton
          title="Войти"
          onPress={onSubmit}
          loading={login.isPending}
          disabled={!formState.isValid}
        />

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
  errorBox: {
    marginTop: 14,
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorIcon: {
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    color: colors.errorText,
    fontSize: 13,
    lineHeight: 18,
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
