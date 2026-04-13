import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoutesScreen } from '../screens/RoutesScreen';
import { ToursScreen } from '../screens/ToursScreen';
import { MapFiltersScreen } from '../screens/map/MapFiltersScreen';
import { ActiveRouteScreen } from '../screens/routes/ActiveRouteScreen';
import { colors } from '../shared/theme/colors';

export type MainTabParamList = {
  Map: undefined;
  Routes: undefined;
  Home: undefined;
  Tours: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  MapFilters: undefined;
  ActiveRoute: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textPrimary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          height: 72,
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Map: 'map-outline',
            Routes: 'options-outline',
            Home: 'home-outline',
            Tours: 'ribbon-outline',
            Profile: 'person-outline',
          };

          if (route.name === 'Home' && focused) {
            return (
              <Ionicons
                name={iconMap[route.name]}
                size={size}
                color={colors.white}
                style={{ backgroundColor: colors.accentButton, borderRadius: 16, padding: 6 }}
              />
            );
          }

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Карты' }} />
      <Tab.Screen name="Routes" component={RoutesScreen} options={{ title: 'Маршруты' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
      <Tab.Screen name="Tours" component={ToursScreen} options={{ title: 'Туры' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="MapFilters"
        component={MapFiltersScreen}
        options={{
          title: 'Назад',
          headerTintColor: colors.textPrimary,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="ActiveRoute"
        component={ActiveRouteScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
