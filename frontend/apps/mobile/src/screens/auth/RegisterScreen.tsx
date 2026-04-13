import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../entities/auth/authStore';
import { AuthPrimaryButton } from '../../features/auth/components/AuthPrimaryButton';
import { LogoMark } from '../../features/auth/components/LogoMark';
import {
  type RegisterFormValues,
  registerSchema,
} from '../../features/auth/schemas/registerSchema';
import { UnderlineField } from '../../features/auth/components/UnderlineField';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const id = `user-${Date.now()}`;
      login({
        id,
        email: values.email.trim(),
        name: values.fullName.trim(),
        phone: values.phone.trim(),
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
          <Text style={styles.title}>Добро пожаловать!</Text>
        </View>

        <UnderlineField control={control} name="fullName" label="Фамилия Имя" />
        <UnderlineField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <UnderlineField
          control={control}
          name="phone"
          label="Номер телефона"
          keyboardType="phone-pad"
        />
        <UnderlineField
          control={control}
          name="password"
          label="Пароль"
          secureTextEntry
          autoCapitalize="none"
        />
        <UnderlineField
          control={control}
          name="confirmPassword"
          label="Повторите пароль"
          secureTextEntry
          autoCapitalize="none"
        />

        <AuthPrimaryButton title="Зарегистрироваться" onPress={onSubmit} loading={submitting} />

        <Text style={styles.footer}>
          Уже есть аккаунт?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Войти
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  top: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
