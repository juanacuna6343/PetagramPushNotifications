import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen
          name="Mapa"
          component={MapScreen}
          options={({ route }) => ({ title: route.params?.place?.name || 'Mapa' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
