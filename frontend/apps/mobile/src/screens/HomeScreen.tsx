import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MainStackParamList } from '../navigation/MainNavigator';
import { nearbyItems, routes } from '../entities/routes/mockData';
import { colors } from '../shared/theme/colors';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const activeRoute = routes.find((r) => r.status === 'active');
  const plannedRoutes = routes.filter((r) => r.status === 'planned');
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Добрый день, Имя!</Text>
      <Text style={styles.subtitle}>Куда отправимся сегодня?</Text>

      <View style={styles.filtersRow}>
        <View style={styles.filterChip}><Text style={styles.filterText}>2 часа</Text></View>
        <View style={styles.filterChip}><Text style={styles.filterText}>искусство</Text></View>
        <View style={styles.filterChip}><Text style={styles.filterText}>рядом</Text></View>
      </View>

      <Pressable style={styles.generateButton}>
        <Text style={styles.generateButtonText}>Сгенерировать маршрут</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Быстрые сценарии</Text>
      <View style={styles.quickGrid}>
        <View style={styles.quickCard}><Text style={styles.quickText}>Кофе рядом</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickText}>Арт-прогулка</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickText}>Спокойный маршрут</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickText}>Еще →</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Для вас</Text>

      {activeRoute && (
        <View style={styles.routeCard}>
          <Text style={[styles.statusDot, { color: '#8FD588' }]}>● Сейчас активен</Text>
          <Text style={styles.routeTitle}>{activeRoute.title}</Text>
          <Text style={styles.routeMeta}>{activeRoute.distanceKm} км • {activeRoute.durationHours} часа</Text>
          <Pressable style={styles.outlineButton} onPress={() => navigation.navigate('ActiveRoute')}>
            <Text style={styles.outlineText}>Продолжить</Text>
          </Pressable>
        </View>
      )}

      {plannedRoutes.map((route) => (
        <View key={route.id} style={styles.routeCard}>
          <Text style={[styles.statusDot, { color: '#D596D5' }]}>● В планах</Text>
          <Text style={styles.routeTitle}>{route.title}</Text>
          <Text style={styles.routeMeta}>{route.distanceKm} км • {route.pace}</Text>
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineText}>Начать</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Рядом сейчас</Text>
      <View style={styles.nearbyRow}>
        {nearbyItems.map((item) => (
          <View key={item.id} style={styles.nearbyCard}>
            <View style={styles.imageStub}>
              <Text style={styles.ratingText}>{item.rating} ({item.votes})</Text>
            </View>
            <Text style={styles.nearbyTitle}>{item.title}</Text>
            <Text style={styles.nearbyMeta}>{item.schedule}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <Pressable style={styles.outlineButton}><Text style={styles.outlineText}>Подробнее</Text></Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 46,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 14,
    fontSize: 26,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  filtersRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 10,
    marginBottom: 10,
  },
  filterText: {
    color: colors.textMuted,
  },
  generateButton: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: colors.accentButton,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginRight: '2%',
    marginBottom: 10,
  },
  quickText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  routeCard: {
    marginTop: 6,
  },
  statusDot: {
    fontSize: 12,
  },
  routeTitle: {
    marginTop: 4,
    fontSize: 36,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  routeMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 20,
  },
  outlineButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  outlineText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  nearbyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nearbyCard: {
    width: '48%',
  },
  imageStub: {
    height: 70,
    borderRadius: 6,
    backgroundColor: '#5C6470',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 6,
  },
  ratingText: {
    color: colors.white,
    fontWeight: '700',
  },
  nearbyTitle: {
    marginTop: 6,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  nearbyMeta: {
    marginTop: 3,
    color: colors.textMuted,
  },
  price: {
    marginTop: 6,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 28,
  },
});

