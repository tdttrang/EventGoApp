import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../components/User/Login";
import Register from "../components/User/Register";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

export default AuthStack;