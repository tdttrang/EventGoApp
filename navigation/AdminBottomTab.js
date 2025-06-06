import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminUserManager from "../components/Admin/AdminUserManager";
import AdminEventManager from "../components/Admin/AdminEventManager";
import AdminStats from "../components/Admin/AdminStats";
import Profile from "../components/User/Profile";
import { MyUserContext } from "../configs/MyContexts";
import { colors } from "../utils/colors";

const Tab = createBottomTabNavigator();

export default function AdminBottomTab() {
  const insets = useSafeAreaInsets();
  const { loggedInUser } = useContext(MyUserContext);

  const tabs = loggedInUser?.role === 'admin' ? [
    { name: "Trang chủ", component: AdminDashboard, icon: "home" },
    { name: "Người dùng", component: AdminUserManager, icon: "people" },
    { name: "Sự kiện", component: AdminEventManager, icon: "calendar" },
    { name: "Thông báo", component: AdminStats, icon: "notifications" },
    { name: "Tài khoản", component: Profile, icon: "person" },
  ] : [
    { name: "Trang chủ", component: AdminDashboard, icon: "home" },
    { name: "Tài khoản", component: Profile, icon: "person" },
  ];

  return (
    <Tab.Navigator
      initialRouteName="Trang chủ"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Trang chủ") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Người dùng") iconName = focused ? "people" : "people-outline";
          else if (route.name === "Sự kiện") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "Thông báo") iconName = focused ? "notifications" : "notifications-outline";
          else if (route.name === "Tài khoản") iconName = focused ? "person" : "person-outline";

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
