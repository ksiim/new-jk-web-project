import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { colors } from '../../shared/theme/colors';

type FormState = {
  current: string;
  next: string;
  repeat: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(state: FormState): Errors {
  const errors: Errors = {};
  if (!state.current) {
    errors.current = 'Введите текущий пароль';
  }
  if (!state.next) {
    errors.next = 'Введите новый пароль';
  } else if (state.next.length < 8) {
    errors.next = 'Минимум 8 символов';
  }
  if (!state.repeat) {
    errors.repeat = 'Повторите новый пароль';
  } else if (state.next && state.repeat !== state.next) {
    errors.repeat = 'Пароли не совпадают';
  }
  return errors;
}

export function ProfileChangePasswordScreen() {
  const [state, setState] = useState<FormState>({
    current: '',
    next: '',
    repeat: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof FormState>(key: K, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = () => {
    const e = validate(state);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    // Бэка под смену пароля пока нет — показываем заглушку.
    showSoonNotice(
      'Смена пароля',
      'Функция будет подключена после появления соответствующего API.',
    );
  };

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

        <Text style={styles.title}>Изменить пароль</Text>

        <PasswordField
          label="Текущий пароль"
          value={state.current}
          onChangeText={(v) => set('current', v)}
          error={errors.current}
        />
        <PasswordField
          label="Новый пароль"
          value={state.next}
          onChangeText={(v) => set('next', v)}
          error={errors.next}
        />
        <PasswordField
          label="Повторите новый пароль"
          value={state.repeat}
          onChangeText={(v) => set('repeat', v)}
          error={errors.repeat}
        />
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton title="Сохранить" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
};

function PasswordField({ label, value, onChangeText, error }: PasswordFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
      />
      <View style={[styles.line, error && styles.lineError]} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 6,
  },
  line: {
    height: 1,
    backgroundColor: colors.line,
  },
  lineError: {
    backgroundColor: colors.errorText,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: colors.errorText,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
