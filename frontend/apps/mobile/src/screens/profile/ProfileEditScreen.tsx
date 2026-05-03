import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
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
import { useExtrasForCurrentUser } from '../../shared/profile/useExtrasForCurrentUser';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { useT } from '../../shared/i18n/useT';
import { Avatar } from '../../shared/ui/Avatar';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ProfileEditScreen() {
  const { t } = useT();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useProfileExtrasStore((s) => s._hasHydrated);
  const extras = useExtrasForCurrentUser(userId);
  const setFullNameStore = useProfileExtrasStore((s) => s.setFullNameForUser);
  const setPhoneStore = useProfileExtrasStore((s) => s.setPhoneForUser);
  const setAvatarStore = useProfileExtrasStore((s) => s.setAvatarForUser);

  const composedFromServer =
    extras.fullName ??
    (user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : '');

  const [fullName, setFullName] = useState(composedFromServer);
  const [email] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(extras.phone ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(extras.avatarUri ?? null);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !userId) return;
      const name =
        extras.fullName ??
        (user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : '');
      setFullName(name);
      setPhone(extras.phone ?? '');
      setAvatarUri(extras.avatarUri ?? null);
    }, [hydrated, userId, user, extras.fullName, extras.phone, extras.avatarUri]),
  );

  const pickPhotoOnWeb = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 6 * 1024 * 1024) {
        Alert.alert(
          'Слишком большой файл',
          'Выберите изображение до 6 МБ или сожмите фото перед загрузкой.',
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const r = reader.result;
        if (typeof r === 'string') setAvatarUri(r);
      };
      reader.onerror = () => {
        const objectUrl = URL.createObjectURL(file);
        setAvatarUri(objectUrl);
      };
      reader.readAsDataURL(file);
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
    } catch {
      Alert.alert(
        'Не удалось открыть галерею',
        'Проверьте, что expo-image-picker установлен и перезапустите Expo.',
      );
    }
  };

  const handleSave = () => {
    if (!userId) return;
    setFullNameStore(userId, fullName.trim() || null);
    setPhoneStore(userId, phone.trim() || null);
    setAvatarStore(userId, avatarUri);
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
        <ScreenHeader label={t('common.back')} />

        <Text style={styles.title}>{t('profileEdit.title')}</Text>

        <View style={styles.avatarRow}>
          <Avatar
            uri={avatarUri}
            name={fullName || composedFromServer}
            width={112}
            height={132}
            radius={14}
            shape="rounded"
          />
          <View style={styles.avatarActions}>
            <Pressable style={styles.avatarBtn} onPress={pickPhoto}>
              <Text style={styles.avatarBtnText}>{t('profileEdit.changePhoto')}</Text>
            </Pressable>
            {avatarUri ? (
              <Pressable style={styles.avatarGhostBtn} onPress={() => setAvatarUri(null)}>
                <Text style={styles.avatarGhostBtnText}>{t('profileEdit.removePhoto')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Field
          label={t('profileEdit.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('profile.namePlaceholder')}
        />
        <Field
          label={t('profileEdit.email')}
          value={email}
          placeholder={t('profile.emailPlaceholder')}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={false}
        />
        <Field
          label={t('profileEdit.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('profileEdit.phonePlaceholder')}
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={() => navigation.navigate('ProfileChangePassword')}
          style={styles.changePwd}
        >
          <Text style={styles.changePwdText}>{t('profileEdit.changePassword')}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <SaveButton title={t('common.save')} onPress={handleSave} disabled={!userId} />
      </View>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  editable = true,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputReadonly]}
        value={value}
        onChangeText={onChangeText ?? (() => {})}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        editable={editable}
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
  inputReadonly: {
    color: colors.textMuted,
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
