import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ProfileEditScreen } from '../screens/profile/ProfileEditScreen';
import { ProfileChangePasswordScreen } from '../screens/profile/ProfileChangePasswordScreen';
import { ProfileInterestsScreen } from '../screens/profile/ProfileInterestsScreen';
import { ProfileNotificationsScreen } from '../screens/profile/ProfileNotificationsScreen';
import { ProfileLanguageScreen } from '../screens/profile/ProfileLanguageScreen';
import { ProfileFavouritesScreen } from '../screens/profile/ProfileFavouritesScreen';
import { ProfileReviewsScreen } from '../screens/profile/ProfileReviewsScreen';
import { ProfileReservationsScreen } from '../screens/profile/ProfileReservationsScreen';
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
  ProfileEdit: undefined;
  ProfileChangePassword: undefined;
  ProfileInterests: undefined;
  ProfileNotifications: undefined;
  ProfileLanguage: undefined;
  ProfileFavourites: undefined;
  ProfileReviews: undefined;
  ProfileReservations: undefined;
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen
        name="MapFilters"
        component={MapFiltersScreen}
        options={{
          headerShown: true,
          title: 'Назад',
          headerTintColor: colors.textPrimary,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen name="ActiveRoute" component={ActiveRouteScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen
        name="ProfileChangePassword"
        component={ProfileChangePasswordScreen}
      />
      <Stack.Screen name="ProfileInterests" component={ProfileInterestsScreen} />
      <Stack.Screen
        name="ProfileNotifications"
        component={ProfileNotificationsScreen}
      />
      <Stack.Screen name="ProfileLanguage" component={ProfileLanguageScreen} />
      <Stack.Screen name="ProfileFavourites" component={ProfileFavouritesScreen} />
      <Stack.Screen name="ProfileReviews" component={ProfileReviewsScreen} />
      <Stack.Screen
        name="ProfileReservations"
        component={ProfileReservationsScreen}
      />
    </Stack.Navigator>
  );
}
