import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { AuthPrimaryButton } from '../../features/auth/components/AuthPrimaryButton';
import { UnderlineField } from '../../features/auth/components/UnderlineField';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { colors } from '../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const schema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(() => {
    // Пока у backend нет endpoint для reset password.
    showSoonNotice(
      'Восстановление пароля',
      'Функция будет подключена после появления API на backend.',
    );
    navigation.goBack();
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
        <ScreenHeader />
        <Text style={styles.title}>Восстановление пароля</Text>
        <Text style={styles.hint}>
          Укажите email аккаунта. Как только backend-метод будет доступен, письмо
          на восстановление будет отправляться автоматически.
        </Text>

        <UnderlineField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AuthPrimaryButton
          title="Продолжить"
          onPress={onSubmit}
          disabled={!formState.isValid}
        />
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
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hint: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
