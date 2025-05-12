import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import các component màn hình
import Home from '../components/Home/Home';
import Booking from '../components/Event/Booking';
import EventDetails from '../components/Event/EventDetails';

import Login from '../components/User/Login';
import Register from '../components/User/Register';
import Profile from '../components/User/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab chính: Home, Booking, Profile
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Booking" component={Booking} options={{ title: 'My tickets' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={Register} options={{ title: 'Sign up' }} />
        <Stack.Screen name="EventDetails" component={EventDetails} options={{ title: 'Event Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
