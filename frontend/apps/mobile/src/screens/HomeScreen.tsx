import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../entities/auth/authStore';
import {
  nearbyItems,
  quickScenarios,
  routes,
  type NearbyItem,
  type QuickScenario,
  type RouteItem,
} from '../entities/routes/mockData';
import type { MainStackParamList } from '../navigation/MainNavigator';
import { colors } from '../shared/theme/colors';

function getGreetingName(fullName: string | undefined, fallback: string) {
  if (!fullName) return fallback;
  const [, name] = fullName.split(/\s+/);
  return name?.trim() || fullName.trim() || fallback;
}

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const firstName = getGreetingName(
    user ? `${user.surname ?? ''} ${user.name ?? ''}`.trim() : undefined,
    'гость',
  );

  const activeRoute = routes.find((r) => r.status === 'active');
  const plannedRoutes = routes.filter((r) => r.status === 'planned');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Добрый день,{'\n'}{firstName}!</Text>
        <Pressable
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Tabs')}
        >
          <Feather name="map-pin" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.sectionLead}>Куда отправимся сегодня?</Text>

      <View style={styles.filtersRow}>
        <View style={styles.filtersLeft}>
          <View style={styles.filtersGroup}>
            <FilterChip label="2 часа" />
            <FilterChip label="искусство" />
          </View>
          <View style={styles.filtersGroup}>
            <FilterChip label="рядом" />
          </View>
        </View>
        <Pressable style={styles.boxBtn}>
          <Feather name="box" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Pressable style={styles.generateBtn}>
        <Text style={styles.generateBtnText}>Сгенерировать маршрут</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Быстрые сценарии</Text>
      <View style={styles.quickGrid}>
        {quickScenarios.map((scenario) => (
          <QuickCard key={scenario.id} scenario={scenario} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Для вас</Text>
      {activeRoute ? (
        <RouteRow
          route={activeRoute}
          onPress={() => navigation.navigate('ActiveRoute')}
          ctaLabel="Продолжить"
          statusLabel="Сейчас активен"
          statusColor={colors.statusActive}
        />
      ) : null}
      {plannedRoutes.map((route) => (
        <RouteRow
          key={route.id}
          route={route}
          ctaLabel="Начать"
          statusLabel="В планах"
          statusColor={colors.statusPlanned}
        />
      ))}

      <Text style={styles.sectionTitle}>Рядом сейчас</Text>
      <View style={styles.nearbyRow}>
        {nearbyItems.map((item) => (
          <NearbyCard key={item.id} item={item} />
        ))}
      </View>

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <Pressable style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
      <Feather name="chevron-down" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

function QuickCard({ scenario }: { scenario: QuickScenario }) {
  return (
    <Pressable style={styles.quickCard}>
      <Feather
        name={scenario.icon}
        size={18}
        color={colors.textPrimary}
        style={styles.quickIcon}
      />
      <Text style={styles.quickText} numberOfLines={1}>
        {scenario.label}
      </Text>
    </Pressable>
  );
}

function RouteRow({
  route,
  ctaLabel,
  statusLabel,
  statusColor,
  onPress,
}: {
  route: RouteItem;
  ctaLabel: string;
  statusLabel: string;
  statusColor: string;
  onPress?: () => void;
}) {
  const meta =
    route.status === 'active'
      ? `${route.distanceKm} км  •  ${route.durationHours} часа`
      : `${route.distanceKm} км  •  ${(route.tags ?? [route.pace]).join('  •  ')}`;

  return (
    <View style={styles.routeRow}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
      <Text style={styles.routeTitle}>{route.title}</Text>
      <Text style={styles.routeMeta}>{meta}</Text>
      <Pressable style={styles.pillBtn} onPress={onPress}>
        <Text style={styles.pillBtnText}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

function NearbyCard({ item }: { item: NearbyItem }) {
  return (
    <View style={styles.nearbyCard}>
      <View style={[styles.nearbyImage, { backgroundColor: item.color }]}>
        <Feather
          name={item.icon}
          size={28}
          color="rgba(255,255,255,0.5)"
          style={styles.nearbyImageIcon}
        />
        <View style={styles.ratingPill}>
          <Feather name="star" size={10} color={colors.white} />
          <Text style={styles.ratingText}>
            {item.rating.toString().replace('.', ',')} ({item.votes})
          </Text>
        </View>
      </View>
      <Text style={styles.nearbyTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.nearbyMeta}>{item.schedule}</Text>
      <Text style={styles.nearbyPrice}>{item.price}</Text>
      <Pressable style={[styles.pillBtn, styles.pillBtnFull]}>
        <Text style={styles.pillBtnText}>Подробнее</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 32,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLead: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  filtersRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filtersLeft: {
    flex: 1,
    gap: 8,
  },
  filtersGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  boxBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  generateBtn: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: colors.accentButton,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 260,
    alignItems: 'center',
  },
  generateBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  quickIcon: {
    opacity: 0.9,
  },
  quickText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flexShrink: 1,
  },

  routeRow: {
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  routeTitle: {
    marginTop: 4,
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  routeMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  pillBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  pillBtnFull: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  pillBtnText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  nearbyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nearbyCard: {
    flex: 1,
  },
  nearbyImage: {
    height: 92,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 8,
  },
  nearbyImageIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  nearbyTitle: {
    marginTop: 8,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  nearbyMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  nearbyPrice: {
    marginTop: 4,
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 8,
  },
});
