import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminUserManager from "../components/Admin/AdminUserManager";
import AdminEventManager from "../components/Admin/AdminEventManager";
import AdminStats from "../components/Admin/AdminStats";  
import AdminDashboard from "../components/Admin/AdminDashboard";  

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminUserManager" component={AdminUserManager} />
      <Stack.Screen name="AdminEventManager" component={AdminEventManager} />
      <Stack.Screen name="AdminStats" component={AdminStats} />
    </Stack.Navigator>
  );
};

export default AdminStack;
