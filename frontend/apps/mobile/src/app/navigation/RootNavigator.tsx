import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { AuthScreen } from '../../screens/AuthScreen';
import { HomeScreen } from '../../screens/HomeScreen';
import { MapScreen } from '../../screens/MapScreen';
import { OnboardingScreen } from '../../screens/OnboardingScreen';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { RoutesScreen } from '../../screens/RoutesScreen';
import { ToursScreen } from '../../screens/ToursScreen';

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Map: undefined;
  Routes: undefined;
  Tours: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Routes" component={RoutesScreen} />
        <Stack.Screen name="Tours" component={ToursScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

