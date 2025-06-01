import React, { useState, useEffect } from "react";
import { MyUserContext } from "./configs/MyContexts";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";


LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go",
]);

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();

    const checkAndSendNotifications = async () => {
      if (!loggedInUser) return;

      try {
        const token = await AsyncStorage.getItem("access");
        const response = await fetch(
          "https://mynameisgiao.pythonanywhere.com/current-user/ticket-history/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Không thể lấy lịch sử vé.");

        const data = await response.json();
        console.log("DEBUG - Ticket history data:", data); // Debug dữ liệu trả về

        // Kiểm tra nếu data là mảng hoặc có trường results (phân trang)
        const tickets = Array.isArray(data) ? data : data.results || [];
        if (tickets.length === 0) {
          console.log("DEBUG - Không có vé nào trong lịch sử.");
          return;
        }

        const now = new Date();
        for (const ticket of tickets) {
          const event = ticket.event;
          if (!event || !event.date || !event.name) {
            console.warn("DEBUG - Dữ liệu sự kiện không hợp lệ:", event);
            continue;
          }

          const eventDate = new Date(event.date);
          const timeDiff = eventDate - now;
          const twoDaysInMs = 48 * 60 * 60 * 1000;

          if (timeDiff > 0 && timeDiff <= twoDaysInMs) {
            // Gửi local notification
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Sự kiện sắp diễn ra!",
                body: `${
                  event.name
                } sẽ bắt đầu vào ${eventDate.toLocaleString()}`,
                sound: true,
              },
              trigger: null, // Local notification ngay lập tức trên Expo Go
            }).catch((error) => console.error("Lỗi gửi thông báo:", error));

            // Gửi thông báo trong hệ thống
            await fetch(
              "https://mynameisgiao.pythonanywhere.com/notifications/create/",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_ids: [loggedInUser?.id],
                  notification_type: "event_reminder",
                  subject: "Sự kiện sắp diễn ra!",
                  message: `${
                    event.name
                  } sẽ bắt đầu vào ${eventDate.toLocaleString()}`,
                  related_object_id: event.id,
                }),
              }
            ).catch((error) =>
              console.error("Lỗi gửi thông báo hệ thống:", error)
            );
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra sự kiện:", err.message);
      }
    };

    checkAndSendNotifications();
  }, [loggedInUser]);

  return (
    <SafeAreaProvider>
      <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <AppNavigator />
      </MyUserContext.Provider>
    </SafeAreaProvider>
  );
}
