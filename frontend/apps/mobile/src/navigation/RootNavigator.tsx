import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { OnboardingAccessibilityScreen } from '../screens/onboarding/OnboardingAccessibilityScreen';
import { OnboardingCompleteScreen } from '../screens/onboarding/OnboardingCompleteScreen';
import { OnboardingInterestsScreen } from '../screens/onboarding/OnboardingInterestsScreen';
import { OnboardingStyleScreen } from '../screens/onboarding/OnboardingStyleScreen';
import { MainNavigator } from './MainNavigator';
import { rootNavigationRef } from './navigationRef';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OnboardingInterests: undefined;
  OnboardingAccessibility: undefined;
  OnboardingStyle: undefined;
  OnboardingComplete: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer ref={rootNavigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen
          name="OnboardingInterests"
          component={OnboardingInterestsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OnboardingAccessibility"
          component={OnboardingAccessibilityScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OnboardingStyle"
          component={OnboardingStyleScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OnboardingComplete"
          component={OnboardingCompleteScreen}
        />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
