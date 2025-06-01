import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const configurePushNotifications = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default Channel",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#FF231F7C",
    }).catch((error) => {
      console.error("Error setting notification channel:", error);
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission to receive notifications was denied");
  }
};

const sendLocalNotification = async (title, message) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
      data: { data: "goes here" },
      sound: true,
    },
    trigger: null, // Gửi ngay lập tức (local notification)
  }).catch((error) => {
    console.error("Error sending notification:", error);
  });
};

export { configurePushNotifications, sendLocalNotification };
