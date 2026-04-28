import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<MainStackParamList, 'TourReviews'>;

const demoImages = [
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
];

export function TourReviewsScreen({ route }: Props) {
  const { tourId: _tourId } = route.params;
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenHeader />
      <Text style={styles.title}>Отзывы: Стретчинг в старом городе</Text>
      <Text style={styles.score}>⭐ 4,9 (120 оценок)</Text>

      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.card}>
          <Text style={styles.cardTitle}>Скетчинг в старом городе</Text>
          <Text style={styles.stars}>⭐⭐⭐⭐☆</Text>
          <Text style={styles.body}>
            Очень классный тур, начинается прямо у старинного фонтана. Где мостовые еще помнят стук подков.
            Представьте: вы не просто идёте по узким улочкам старого квартала, а проживаете город.
          </Text>
          {item === 1 ? (
            <View style={styles.photos}>
              {demoImages.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photo} />
              ))}
            </View>
          ) : null}
          {item === 1 ? <Pressable><Text style={styles.link}>Показать фото и видео</Text></Pressable> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { marginTop: 8, color: colors.textPrimary, fontWeight: '800', fontSize: 24, lineHeight: 38 },
  score: { marginTop: 8, color: colors.textPrimary, fontSize: 20 / 1.2, fontWeight: '700' },
  card: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 18 / 1.15 },
  stars: { marginTop: 6, fontSize: 22 / 1.2 },
  body: { marginTop: 6, color: colors.textPrimary, fontSize: 17 / 1.2, lineHeight: 24 },
  photos: { marginTop: 10, flexDirection: 'row', gap: 8 },
  photo: { width: 90, height: 90, borderRadius: 10 },
  link: { marginTop: 8, color: colors.textPrimary, fontWeight: '600', textDecorationLine: 'underline' },
});
