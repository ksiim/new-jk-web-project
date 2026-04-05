import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '../app/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mestny Vzglyad</Text>
      <Text style={styles.subtitle}>Mobile MVP skeleton</Text>

      <View style={styles.grid}>
        <Pressable style={styles.card} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.cardTitle}>Auth</Text>
          <Text style={styles.cardText}>Login / Register</Text>
        </Pressable>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.cardTitle}>Onboarding</Text>
          <Text style={styles.cardText}>Interests / limitations</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.cardTitle}>Map</Text>
          <Text style={styles.cardText}>POE points</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => navigation.navigate('Routes')}>
          <Text style={styles.cardTitle}>Routes</Text>
          <Text style={styles.cardText}>Generate / history</Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => navigation.navigate('Tours')}>
          <Text style={styles.cardTitle}>Tours</Text>
          <Text style={styles.cardText}>Catalog</Text>
        </Pressable>
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardText}>User / Guide</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f8fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
});

