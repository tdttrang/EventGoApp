import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Home from "../components/Home/Home";
import Tickets from "../components/Tickets/Tickets";
import Notifications from "../components/Notifications/Notifications";
import Profile from "../components/User/Profile";
import ManageEvents from "../components/Event/ManageEvents";
import { MyUserContext } from "../configs/MyContexts";
import { colors } from "../utils/colors";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  const insets = useSafeAreaInsets();
  const { loggedInUser } = useContext(MyUserContext);

  // Xác định tabs dựa trên role
  const tabs =
    loggedInUser?.role === "organizer"
      ? [
          { name: "Trang chủ", component: Home, icon: "home" },
          {
            name: "Quản lý",
            component: ManageEvents,
            icon: "calendar",
          }, 
          {
            name: "Thông báo",
            component: Notifications,
            icon: "notifications",
          },
          { name: "Tài khoản", component: Profile, icon: "person" },
        ]
      : [
          { name: "Trang chủ", component: Home, icon: "home" },
          { name: "Vé của tôi", component: Tickets, icon: "ticket" },
          {
            name: "Thông báo",
            component: Notifications,
            icon: "notifications",
          },
          { name: "Tài khoản", component: Profile, icon: "person" },
        ];

  return (
    <Tab.Navigator
      initialRouteName="Trang chủ"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Trang chủ")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Quản lý")
            iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Vé của tôi")
            iconName = focused ? "ticket" : "ticket-outline";
          else if (route.name === "Thông báo")
            iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Tài khoản")
            iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: "#1C2526",
          borderTopColor: "transparent",
          paddingTop: 5,
          height: 60 + (insets.bottom || 10),
          paddingBottom: insets.bottom || 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ headerShown: false }}
        />
      ))}
    </Tab.Navigator>
  );
}
