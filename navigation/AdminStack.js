import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashBoard from "../components/Admin/AdminDashboard";
import AdminEventManager from "../components/Admin/AdminEventManager";
import AdminStats from "../components/Admin/AdminStats";  

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashBoard" component={AdminDashBoard} />
      <Stack.Screen name="AdminEventManager" component={AdminEventManager} />
      <Stack.Screen name="AdminStats" component={AdminStats} />
    </Stack.Navigator>
  );
};

export default AdminStack;
