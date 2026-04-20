import { Feather } from '@expo/vector-icons';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { favouritesMock, type FavouriteItem } from '../../entities/profile/mocks';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { showSoonNotice } from '../../shared/ui/showSoonNotice';
import { colors } from '../../shared/theme/colors';

export function ProfileFavouritesScreen() {
  return (
    <View style={styles.flex}>
      <FlatList
        data={favouritesMock}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScreenHeader />
            <Text style={styles.title}>Избранное</Text>
          </>
        }
        renderItem={({ item }) => <FavouriteCard item={item} />}
      />
    </View>
  );
}

function FavouriteCard({ item }: { item: FavouriteItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.ratingPill}>
          <Feather name="star" size={10} color={colors.white} />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewsCount})
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.metaRow}>
        <Feather name="user" size={12} color={colors.textMuted} />
        <Text style={styles.metaText}>
          {item.guide}
          {item.capacity ? ` (${item.capacity})` : ''}
        </Text>
      </View>
      <Text style={styles.metaText}>{item.schedule}</Text>
      <Text style={styles.price}>{item.priceLabel}</Text>
      <Pressable
        style={styles.moreBtn}
        onPress={() => showSoonNotice('Подробнее')}
      >
        <Text style={styles.moreBtnText}>Подробнее</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: colors.line,
  },
  ratingPill: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.overlayCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  moreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  moreBtnText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
