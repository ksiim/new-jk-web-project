import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MainStackParamList } from '../navigation/MainNavigator';
import { colors } from '../shared/theme/colors';

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <View style={styles.root}>
      <View style={styles.mapCanvas}>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}><Text style={styles.searchText}>Поиск</Text></View>
          <Pressable style={styles.filterBtn} onPress={() => navigation.navigate('MapFilters')}>
            <Text style={styles.filterBtnText}>⎚</Text>
          </Pressable>
        </View>

        <Pressable style={styles.centerPin} onPress={() => navigation.navigate('ActiveRoute')}>
          <Text style={styles.pin}>📍</Text>
        </Pressable>
        <Text style={[styles.marker, { top: 180, left: 120 }]}>☕</Text>
        <Text style={[styles.marker, { top: 250, left: 65 }]}>✎</Text>
        <Text style={[styles.marker, { top: 220, left: 230 }]}>🌿</Text>
      </View>

      <Pressable style={styles.panel} onPress={() => navigation.navigate('ActiveRoute')}>
        <Text style={styles.panelTitle}>Прогулка: искусство и кофе</Text>
        <Text style={styles.chevron}>˄</Text>
      </Pressable>

      <View style={styles.panelSecondary}>
        <Text style={styles.panelSecondaryTitle}>Готовые маршруты</Text>
        <Text style={styles.chevron}>˄</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#EFE9DF',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  searchText: { color: '#7A8494', fontSize: 16 },
  filterBtn: {
    marginLeft: 8,
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  filterBtnText: { color: colors.textPrimary, fontSize: 18 },
  centerPin: {
    position: 'absolute',
    top: '48%',
    left: '48%',
  },
  pin: { fontSize: 20 },
  marker: { position: 'absolute', fontSize: 18 },
  panel: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '700' },
  panelSecondary: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelSecondaryTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
  chevron: { color: colors.textPrimary, fontSize: 20 },
});

