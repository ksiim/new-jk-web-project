import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { activeRoutePoints } from '../../entities/routes/mockData';
import { colors } from '../../shared/theme/colors';

export function ActiveRouteScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchText}>Поиск</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.routeTitle}>Прогулка: искусство и кофе</Text>
          <Text style={styles.chevron}>˅</Text>
        </View>

        <Text style={styles.listTitle}>Список точек маршрута:</Text>

        {activeRoutePoints.map((point, index) => (
          <View key={point.id} style={styles.pointRow}>
            <View style={styles.pointTextWrap}>
              <Text style={styles.pointIndex}>{index + 1}. {point.title}</Text>
            </View>
            <View style={styles.pointImage}>
              <Text style={styles.pointRating}>{point.imageLabel}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Приостановить</Text>
        </Pressable>
        <Pressable style={[styles.primaryButton, styles.secondaryButton]}>
          <Text style={styles.primaryButtonText}>Завершить</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchText: {
    color: '#7a8494',
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    fontSize: 30,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  listTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  pointTextWrap: {
    flex: 1,
  },
  pointIndex: {
    fontSize: 17,
    color: '#5C6470',
    lineHeight: 24,
  },
  pointImage: {
    width: 140,
    height: 74,
    borderRadius: 6,
    backgroundColor: '#7C8378',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 8,
  },
  pointRating: {
    color: colors.white,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: colors.accentButton,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minWidth: 190,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
  },
});
