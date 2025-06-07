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

const OrganizerDashboard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { setLoggedInUser } = React.useContext(MyUserContext);

  // Dữ liệu tổng quan
  const [summaryData, setSummaryData] = useState({
    soldTickets: 0,
    totalRevenue: 0,
    totalComments: 0,
  });
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        const api = authApi(token);
        // 1. Lấy danh sách tất cả sự kiện của organizer
        const eventsRes = await api.get("events");
        const events = eventsRes.data.results || eventsRes.data || [];
        const eventIds = events.map((e) => e.id);

        // 2. Lặp qua từng event để lấy số vé, doanh thu, phản hồi
        let soldTickets = 0;
        let totalRevenue = 0;
        let totalComments = 0;

        for (const eventId of eventIds) {
          console.log("Processing eventId:", eventId);
          // Số vé đã bán
          try {
            const soldTicketsRes = await api.get(
              endpoints.organizer_event_sold_tickets(eventId)
            );
            soldTickets +=
              typeof soldTicketsRes.data.sold_tickets === "number"
                ? soldTicketsRes.data.sold_tickets
                : Array.isArray(soldTicketsRes.data)
                ? soldTicketsRes.data.length
                : 0;
          } catch {}

          // Doanh thu
          try {
            const revenueRes = await api.get(
              endpoints.organizer_event_total_revenue(eventId)
            );
            totalRevenue +=
              typeof revenueRes.data.total_revenue === "number"
                ? revenueRes.data.total_revenue
                : 0;
          } catch {}

          // Phản hồi
          try {
            const feedbackRes = await api.get(
              endpoints.organizer_event_reviews_with_replies(eventId)
            );
            totalComments += Array.isArray(feedbackRes.data.results)
              ? feedbackRes.data.results.length
              : 0;
          } catch {}
        }
        console.log("soldTickets:", soldTickets);
        console.log("totalRevenue:", totalRevenue);
        console.log("totalComments:", totalComments);
        setSummaryData((prev) => ({
          ...prev,
          soldTickets,
          totalRevenue,
          totalComments,
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
        <Text style={styles.logo}>Trang Thống Kê</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollViewContent}>
        {/* Tổng Quan Hệ Thống */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Tổng quan</Text>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryItem}>
              Tổng số vé đã bán: {summaryData.soldTickets}
            </Text>
            <Text style={styles.summaryItem}>
              Tổng doanh thu:{" "}
              {typeof summaryData.totalRevenue === "number" &&
              !isNaN(summaryData.totalRevenue)
                ? summaryData.totalRevenue.toLocaleString()
                : "0"}
            </Text>
            <Text style={styles.summaryItem}>
              Tổng số bình luận của các sự kiện: {summaryData.totalComments}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("approveOrganizer")}
          >
            <Text style={styles.actionButtonText}>Vé đã bán</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("manageEvents")}
          >
            <Text style={styles.actionButtonText}>Doanh thu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("reports")}
          >
            <Text style={styles.actionButtonText}>Bình luận</Text>
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

export default OrganizerDashboard;
