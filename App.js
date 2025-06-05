import React, { useState, useEffect, useRef, useContext } from "react";
import { MyUserContext } from "./configs/MyContexts";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox, Platform } from "react-native";
import * as Device from "expo-device";
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
]);

// Cấu hình hiển thị thông báo khi app đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  return (
    <SafeAreaProvider>
      <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <AppNavigator />
      </MyUserContext.Provider>
    </SafeAreaProvider>
  );
}
