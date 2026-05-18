import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen      from '../screens/LoginScreen';
import DashboardScreen  from '../screens/DashboardScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';
import { colors } from '../components/theme';
import GeneratorScreen from '../screens/GeneratorScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {!isLoggedIn ? (
          // Auth stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App stack
          <>
            <Stack.Screen name="Dashboard"   component={DashboardScreen}  />
            <Stack.Screen name="AddPassword" component={AddPasswordScreen} />
            <Stack.Screen name="Generator" component={GeneratorScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
