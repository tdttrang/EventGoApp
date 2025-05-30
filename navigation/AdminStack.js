import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashBoard from "../components/Admin/AdminDashboard";

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashBoard" component={AdminDashBoard} />
      {/* Các màn hình khác nếu cần */}
    </Stack.Navigator>
  );
};

export default AdminStack;
