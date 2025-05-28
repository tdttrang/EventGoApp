import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTab from "./BottomTab";
import Search from "../components/Home/Search";
import EventDetails from "../components/Event/EventDetails";
import Booking from "../components/Event/Booking";
import Home from "../components/Home/Home";

const Stack = createNativeStackNavigator();

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTab" component={BottomTab} />
    <Stack.Screen name="Search" component={Search} />
    <Stack.Screen name="EventDetails" component={EventDetails} />
    <Stack.Screen name="Booking" component={Booking} />
        <Stack.Screen name="Home" component={Home} /> 

  </Stack.Navigator>
);

export default AppStack;