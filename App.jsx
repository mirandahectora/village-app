import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import AuthScreen from './src/screens/AuthScreen'
import DashboardScreen from './src/screens/DashboardScreen'

const Stack = createStackNavigator()

function RootNavigator() {
  const { user } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {user ? (
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#F4EEE2" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
