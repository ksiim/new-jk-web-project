import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'GuideProfile'>;

export function GuideProfileScreen({ route, navigation }: Props) {
  const { tourId } = route.params;
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <View style={styles.top}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>Анна Петрова</Text>
          <Text style={styles.meta}>example@email.com</Text>
          <Text style={styles.meta}>TG: example_uwu</Text>
          <Text style={styles.rating}>☆ 4,9 (120 отзывов)</Text>
          <Pressable style={styles.msgBtn}>
            <Text style={styles.msgText}>Написать</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.bio}>
        Люблю свой город и знаю о нём почти всё. Проведу по тайным дворикам, расскажу истории, которых нет
        в интернете. Со мной вы не просто посмотрите, а почувствуете атмосферу. Будет интересно и душевно.
      </Text>

      <Text style={styles.section}>⚙ Специализации</Text>
      <Text style={styles.sectionItem}>стрит-арт</Text>
      <Text style={styles.sectionItem}>Архитектура</Text>
      <Text style={styles.sectionItem}>Локальная культура</Text>

      <Text style={styles.section}>🌐 Языки</Text>
      <Text style={styles.sectionItem}>русский / English</Text>

      <Text style={styles.section}>🧭 Опыт</Text>
      <Text style={styles.sectionItem}>5 лет в сфере</Text>
      <Text style={styles.sectionItem}>20+ туров</Text>

      <Text style={styles.section}>Туры гида</Text>
      <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('TourDetail', { tourId })}>
        <Text style={styles.linkBtnText}>Открыть тур</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  top: { marginTop: 8, flexDirection: 'row', gap: 14 },
  avatar: { width: 120, height: 156, borderRadius: 14, backgroundColor: colors.line },
  info: { flex: 1, paddingTop: 2 },
  name: { color: colors.textPrimary, fontSize: 34 / 2, fontWeight: '800' },
  meta: { marginTop: 8, color: colors.textMuted, fontSize: 18 / 1.2 },
  rating: { marginTop: 8, color: colors.textPrimary, fontSize: 17 / 1.2, fontWeight: '700' },
  msgBtn: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: colors.accentButton,
    paddingVertical: 10,
    alignItems: 'center',
  },
  msgText: { color: colors.white, fontWeight: '700', fontSize: 32 / 2 },
  bio: { marginTop: 12, color: colors.textPrimary, fontSize: 20 / 1.25, lineHeight: 29 },
  section: { marginTop: 14, color: colors.textPrimary, fontWeight: '800', fontSize: 34 / 2 },
  sectionItem: { marginTop: 4, color: colors.textMuted, fontSize: 18 / 1.2 },
  linkBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  linkBtnText: { color: colors.textPrimary, fontWeight: '600' },
});
