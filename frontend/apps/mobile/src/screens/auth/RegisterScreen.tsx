import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { AuthPrimaryButton } from '../../features/auth/components/AuthPrimaryButton';
import { LogoMark } from '../../features/auth/components/LogoMark';
import {
  type RegisterFormValues,
  registerSchema,
  splitFullName,
} from '../../features/auth/schemas/registerSchema';
import { UnderlineField } from '../../features/auth/components/UnderlineField';
import { extractApiError } from '../../shared/api/http';
import { useLogin, useRegister } from '../../shared/auth/hooks';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

// Заглушка, пока на бэке date_of_birth обязателен. Когда поле сделают nullable,
// убрать и не передавать его в payload.
const DATE_OF_BIRTH_FALLBACK = '2000-01-01';

export function RegisterScreen({ navigation }: Props) {
  const register = useRegister();
  const login = useLogin();
  const submitting = register.isPending || login.isPending;

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const email = values.email.trim();
    const password = values.password;
    const { surname, name } = splitFullName(values.fullName);

    try {
      await register.mutateAsync({
        name,
        surname,
        patronymic: null,
        email,
        password,
        date_of_birth: DATE_OF_BIRTH_FALLBACK,
      });
      await login.mutateAsync({ email, password });
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingInterests' }] });
    } catch (error) {
      Alert.alert('Не удалось зарегистрироваться', extractApiError(error));
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

        <UnderlineField control={control} name="fullName" label="Фамилия и имя" />
        <UnderlineField
          control={control}
          name="phone"
          label="Телефон"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
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
        <UnderlineField
          control={control}
          name="confirmPassword"
          label="Повторите пароль"
          secureTextEntry
          autoCapitalize="none"
        />

        <AuthPrimaryButton
          title="Зарегистрироваться"
          onPress={onSubmit}
          loading={submitting}
        />

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
