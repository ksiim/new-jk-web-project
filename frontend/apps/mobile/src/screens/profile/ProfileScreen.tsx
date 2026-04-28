import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../entities/auth/authStore';
import { useProfileExtrasStore } from '../../entities/profile/profileExtrasStore';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import { rootNavigationRef } from '../../navigation/navigationRef';
import { Avatar } from '../../shared/ui/Avatar';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { useLogout } from '../../shared/auth/hooks';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const phone = useProfileExtrasStore((s) => s.phone);
  const localFullName = useProfileExtrasStore((s) => s.fullName);
  const avatarUri = useProfileExtrasStore((s) => s.avatarUri);
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const serverFullName = user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : '';
  const composedName = localFullName ?? serverFullName;
  const displayName = composedName || 'Фамилия Имя';
  const displayEmail = user?.email ?? 'example@email.com';
  const displayPhone = phone ?? '+7 (999) 888 - 77 - 66';
  const hasLocalProfileData = Boolean(localFullName || phone || avatarUri);

  const handleLogout = () => {
    setConfirmOpen(false);
    logout();
    if (rootNavigationRef.isReady()) {
      rootNavigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Math.max(insets.top, 12) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Профиль</Text>

        <View style={styles.userRow}>
          <Avatar
            uri={avatarUri}
            name={displayName}
            width={116}
            height={136}
            radius={14}
            shape="rounded"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            {hasLocalProfileData ? (
              <Text style={styles.localHint}>Некоторые изменения сохранены локально</Text>
            ) : null}
            <Text style={styles.userMeta}>{displayEmail}</Text>
            <Text style={styles.userMeta}>{displayPhone}</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Text style={styles.editBtnText}>Редактировать</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tilesRow}>
          <Tile
            icon="heart"
            label="Избранное"
            onPress={() => navigation.navigate('ProfileFavourites')}
          />
          <Tile
            icon="message-square"
            label="Ваши отзывы"
            onPress={() => navigation.navigate('ProfileReviews')}
          />
        </View>
        <View style={styles.tilesRow}>
          <Tile
            icon="map"
            label="Бронирования"
            onPress={() => navigation.navigate('ProfileReservations')}
          />
          <Tile
            icon="credit-card"
            label="Платежи"
            onPress={() => showSoonNotice('Платежи')}
          />
        </View>

        <View style={styles.menu}>
          <MenuRow
            label="Ваши интересы и настройки"
            onPress={() => navigation.navigate('ProfileInterests')}
          />
          <MenuRow
            label="Уведомления"
            onPress={() => navigation.navigate('ProfileNotifications')}
          />
          <MenuRow
            label="Язык"
            onPress={() => navigation.navigate('ProfileLanguage')}
          />
          <MenuRow
            label="Политика и условия пользования"
            onPress={() => showSoonNotice('Политика и условия')}
          />
          <MenuRow label="Помощь" onPress={() => showSoonNotice('Помощь')} />
        </View>

        <View style={styles.guideBlock}>
          <Text style={styles.guideHint}>Хотите делиться опытом?</Text>
          <Pressable
            style={styles.guideBtn}
            onPress={() => showSoonNotice('Режим гида')}
          >
            <Text style={styles.guideBtnText}>Перейти в режим гида</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutRow}
          onPress={() => setConfirmOpen(true)}
        >
          <Text style={styles.logoutText}>Выйти из профиля</Text>
          <Feather name="log-out" size={18} color={colors.textPrimary} />
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={confirmOpen}
        title="Вы уверены, что хотите выйти?"
        onConfirm={handleLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}

type TileProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
};

function Tile({ icon, label, onPress }: TileProps) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <LinearGradient
        colors={colors.gradientTile}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.tileBg}
      >
        <Feather name={icon} size={26} color={colors.white} />
        <Text style={styles.tileLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

type MenuRowProps = {
  label: string;
  onPress: () => void;
};

function MenuRow({ label, onPress }: MenuRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userMeta: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  localHint: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  editBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.accentButton,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  editBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tileBg: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 82,
    justifyContent: 'space-between',
  },
  tileLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
  },
  menu: {
    marginTop: 10,
    gap: 6,
  },
  menuRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  guideBlock: {
    marginTop: 18,
  },
  guideHint: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  guideBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  guideBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
