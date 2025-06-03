import { useEffect, useContext } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../configs/MyContexts";

export const useUpcomingEventsNotifier = () => {
  const { loggedInUser } = useContext(MyUserContext);

  useEffect(() => {
    const checkAndNotify = async () => {
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
        const tickets = Array.isArray(data) ? data : data.results || [];

        const now = new Date();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        for (const ticket of tickets) {
          const event = ticket.event;
          if (!event?.date || !event?.name) continue;

          const eventDate = new Date(event.date);
          const timeDiff = eventDate - now;

          if (timeDiff > 0 && timeDiff <= twoDaysInMs) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Sự kiện sắp diễn ra!",
                body: `${
                  event.name
                } sẽ bắt đầu vào ${eventDate.toLocaleString()}`,
                sound: true,
              },
              trigger: null,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi gửi thông báo:", err.message);
      }
    };

    checkAndNotify();
  }, [loggedInUser]);
};
