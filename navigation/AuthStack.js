import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/User/Login';
import Register from '../components/User/Register';
import React from 'react';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}
