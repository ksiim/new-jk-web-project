import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuthStore } from '../../entities/auth/authStore';
import { useProfileExtrasStore } from '../../entities/profile/profileExtrasStore';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ProfileEditScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const initialFullName = useProfileExtrasStore((s) => s.fullName);
  const initialPhone = useProfileExtrasStore((s) => s.phone);
  const setFullNameStore = useProfileExtrasStore((s) => s.setFullName);
  const setPhoneStore = useProfileExtrasStore((s) => s.setPhone);

  const composedName =
    initialFullName ??
    (user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : '');

  const [fullName, setFullName] = useState(composedName);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');

  const handleSave = () => {
    setFullNameStore(fullName.trim() || null);
    setPhoneStore(phone.trim() || null);
    // Email в демо-режиме не шлём на бэк (нет эндпоинта смены email).
    // Когда появится — отсюда вызов мутации.
    navigation.goBack();
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

        <Text style={styles.title}>Редактирование{'\n'}профиля</Text>

        <Field
          label="Фамилия Имя"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Фамилия Имя"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Номер телефона"
          value={phone}
          onChangeText={setPhone}
          placeholder="+7 (999) 888 - 77 - 66"
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={() => navigation.navigate('ProfileChangePassword')}
          style={styles.changePwd}
        >
          <Text style={styles.changePwdText}>Изменить пароль</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton onPress={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      <View style={styles.line} />
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
    lineHeight: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
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
  changePwd: {
    marginTop: 4,
  },
  changePwdText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
