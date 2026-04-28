import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
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
import { Avatar } from '../../shared/ui/Avatar';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ProfileEditScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const initialFullName = useProfileExtrasStore((s) => s.fullName);
  const initialPhone = useProfileExtrasStore((s) => s.phone);
  const initialAvatarUri = useProfileExtrasStore((s) => s.avatarUri);
  const setFullNameStore = useProfileExtrasStore((s) => s.setFullName);
  const setPhoneStore = useProfileExtrasStore((s) => s.setPhone);
  const setAvatarStore = useProfileExtrasStore((s) => s.setAvatarUri);

  const composedName =
    initialFullName ??
    (user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : '');

  const [fullName, setFullName] = useState(composedName);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(initialAvatarUri ?? null);

  const pickPhotoOnWeb = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      setAvatarUri(objectUrl);
    };
    input.click();
  };

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
      pickPhotoOnWeb();
      return;
    }

    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Нет доступа', 'Разрешите доступ к фото, чтобы выбрать аватар.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Не удалось открыть галерею',
        'Проверьте, что expo-image-picker установлен и перезапустите Expo.',
      );
    }
  };

  const handleSave = () => {
    setFullNameStore(fullName.trim() || null);
    setPhoneStore(phone.trim() || null);
    setAvatarStore(avatarUri);
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
        <Text style={styles.hint}>
          Поля на этом экране пока сохраняются локально на устройстве.
        </Text>

        <View style={styles.avatarRow}>
          <Avatar
            uri={avatarUri}
            name={fullName || composedName}
            width={112}
            height={132}
            radius={14}
            shape="rounded"
          />
          <View style={styles.avatarActions}>
            <Pressable style={styles.avatarBtn} onPress={pickPhoto}>
              <Text style={styles.avatarBtnText}>Изменить фото</Text>
            </Pressable>
            {avatarUri ? (
              <Pressable style={styles.avatarGhostBtn} onPress={() => setAvatarUri(null)}>
                <Text style={styles.avatarGhostBtnText}>Удалить фото</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

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
        <Text style={styles.inlineHint}>Email берется из аккаунта и пока не изменяется на сервере.</Text>
        <Field
          label="Номер телефона"
          value={phone}
          onChangeText={setPhone}
          placeholder="+7 (999) 888 - 77 - 66"
          keyboardType="phone-pad"
        />
        <Text style={styles.inlineHint}>Телефон пока хранится только локально в приложении.</Text>

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
  hint: {
    marginTop: -12,
    marginBottom: 14,
    fontSize: 12,
    color: colors.textMuted,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    alignItems: 'center',
  },
  avatarActions: {
    flex: 1,
    gap: 10,
  },
  avatarBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.accentButton,
  },
  avatarBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  avatarGhostBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  avatarGhostBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
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
  inlineHint: {
    marginTop: -12,
    marginBottom: 14,
    fontSize: 11,
    color: colors.textMuted,
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
