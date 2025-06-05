import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import Welcome from "../components/User/Welcome";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import AdminStack from "./AdminStack";
import { authApi, endpoints } from "../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../configs/MyContexts";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { loggedInUser, setLoggedInUser } = useContext(MyUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        if (token) {
          const res = await authApi(token).get(endpoints.currentUser);
          setLoggedInUser({ 
            token,
            ...res.data,
          });
        } else {
          setLoggedInUser(null);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        await AsyncStorage.removeItem("access");
        setLoggedInUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1C2526" }}>
        <ActivityIndicator size="large" color="#00B14F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loggedInUser ? (
          loggedInUser.role === "admin" ? (
            <Stack.Screen name="AdminStack" component={AdminStack} />
          ) : (
            <Stack.Screen name="AppStack" component={AppStack} />
          )
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="AuthStack" component={AuthStack} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;