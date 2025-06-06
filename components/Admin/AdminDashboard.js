import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../utils/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/MyContexts";
import { endpoints, authApi } from "../../configs/Apis";

const AdminDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { setLoggedInUser } = React.useContext(MyUserContext);

  // Dữ liệu tổng quan
  const [summaryData, setSummaryData] = useState({
    pendingOrganizers: 0,
    totalEvents: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        const response = await fetch(
          "https://mynameisgiao.pythonanywhere.com/api/admin/users/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        // Nếu API trả về mảng user
        const users = Array.isArray(data) ? data : data.results || [];
        const totalUsers = users.length;
        const totalOrganizers = users.filter(
          (u) => u.role === "organizer" && u.is_approved === false
        ).length;

        // Lấy event
        const eventsRes = await fetch(
          "https://mynameisgiao.pythonanywhere.com/api/events/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const eventsData = await eventsRes.json();
        const totalEvents = Array.isArray(eventsData) ? eventsData.length : 0;

        setSummaryData((prev) => ({
          ...prev,
          totalUsers,
          pendingOrganizers: totalOrganizers,
          totalEvents,
        }));
      } catch (err) {
        console.log("Error fetching summary data:", err);
      }
    };
    fetchSummary();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access");
    await AsyncStorage.removeItem("refresh");
    setLoggedInUser(null);
  };

  const handleQuickAction = (action) => {
    if (action === "approveOrganizer") {
      navigation.navigate("AdminUserManager");
    } else if (action === "manageEvents") {
      navigation.navigate("AdminEventManager");
    } else if (action === "reports") {
      navigation.navigate("AdminStats");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 56 + insets.top },
        ]}
      >
        <Text style={styles.logo}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollViewContent}>
        {/* Tổng Quan Hệ Thống */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Tổng quan Hệ thống</Text>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryItem}>
              Số Organizer chờ duyệt: {summaryData.pendingOrganizers}
            </Text>
            <Text style={styles.summaryItem}>
              Tổng số Sự kiện: {summaryData.totalEvents}
            </Text>
            <Text style={styles.summaryItem}>
              Người tham gia toàn hệ thống: {summaryData.totalUsers}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("approveOrganizer")}
          >
            <Text style={styles.actionButtonText}>Duyệt Organizer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("manageEvents")}
          >
            <Text style={styles.actionButtonText}>Quản lý</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("reports")}
          >
            <Text style={styles.actionButtonText}>Báo cáo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: colors.green,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryInfo: {
    marginTop: 10,
  },
  summaryItem: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AdminDashboard;
