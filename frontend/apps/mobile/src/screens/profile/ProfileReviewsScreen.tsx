import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { reviewsMock, type ReviewItem } from '../../entities/profile/mocks';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { Stars } from '../../shared/ui/Stars';
import { colors } from '../../shared/theme/colors';

export function ProfileReviewsScreen() {
  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader />
        <Text style={styles.title}>Отзывы</Text>

        <View style={styles.list}>
          {reviewsMock.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const COLLAPSED_LENGTH = 120;

function ReviewCard({ item }: { item: ReviewItem }) {
  const [expanded, setExpanded] = useState(false);
  const needTruncate = item.text.length > COLLAPSED_LENGTH;
  const visibleText =
    !needTruncate || expanded
      ? item.text
      : `${item.text.slice(0, COLLAPSED_LENGTH).trim()}…`;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.stars}>
        <Stars value={item.rating} />
      </View>
      <Text style={styles.text}>
        {visibleText}
        {needTruncate ? (
          <Text style={styles.moreLink} onPress={() => setExpanded((v) => !v)}>
            {expanded ? ' свернуть' : ' ещё'}
          </Text>
        ) : null}
      </Text>
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
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stars: {
    marginTop: 6,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  moreLink: {
    color: colors.textSubtle,
    fontWeight: '600',
  },
});
