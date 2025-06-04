import React, { useState, useEffect, useRef, useContext } from "react";
import { MyUserContext } from "./configs/MyContexts";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox, Platform } from "react-native";
import * as Device from "expo-device";

import { useUpcomingEventsNotifier } from "./hooks/useUpcomingEventsNotifier";

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

  // Đăng ký nhận token push notification và thiết lập listener
  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Không cấp quyền gửi thông báo!");
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log("Expo Push Token:", tokenData.data);
        setExpoPushToken(tokenData.data);
      } else {
        alert("Chạy app trên thiết bị thật để nhận push notification.");
      }
    };

    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Nhận thông báo khi app đang mở:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Người dùng nhấn vào thông báo:", response);
        // Có thể xử lý điều hướng tại đây nếu muốn
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Hook kiểm tra và gửi thông báo sự kiện sắp diễn ra
  useUpcomingEventsNotifier(loggedInUser);

  return (
    <SafeAreaProvider>
      <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <AppNavigator />
      </MyUserContext.Provider>
    </SafeAreaProvider>
  );
}
