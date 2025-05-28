import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Home from "../components/Home/Home";
import Tickets from "../components/Tickets/Tickets";
import Notifications from "../components/Notifications/Notifications";
import Profile from "../components/User/Profile";
import { colors } from "../utils/colors";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Trang chủ"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Trang chủ") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Vé của tôi") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "Thông báo") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Tài khoản") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: "#1C2526",
          borderTopColor: "transparent",
          paddingTop: 5,
          height: 60 + (insets.bottom || 10), // Thêm insets.bottom để đẩy tab lên trên thanh điều hướng
          paddingBottom: insets.bottom || 10, // Đảm bảo nội dung tab không bị che
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={Home} />
      <Tab.Screen name="Vé của tôi" component={Tickets} />
      <Tab.Screen name="Thông báo" component={Notifications} />
      <Tab.Screen name="Tài khoản" component={Profile} />
    </Tab.Navigator>
  );
}