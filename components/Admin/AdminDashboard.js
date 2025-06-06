import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { colors } from "../../utils/colors";  // Dùng màu sắc từ utils/colors
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Để tính toán phần notches
import AdminBottomTab from "../../navigation/AdminBottomTab";  // Điều chỉnh lại đường dẫn
import { TouchableOpacity } from 'react-native';


const AdminDashboard = () => {
  const insets = useSafeAreaInsets();

  // Dữ liệu tổng quan
  const summaryData = {
    pendingOrganizers: 12,
    totalEvents: 342,
    totalUsers: 15000,
  };

  const handleQuickAction = (action) => {
    // Điều hướng đến các trang khác
    if (action === "approveOrganizer") {
      // Duyệt tổ chức viên
    } else if (action === "manageEvents") {
      // Quản lý sự kiện
    } else if (action === "reports") {
      // Xem báo cáo
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Text style={styles.logo}>Admin Dashboard</Text>
        <Ionicons name="notifications-outline" size={24} color={colors.white} />
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
            <Text style={styles.actionButtonText}>Quản lý Sự kiện</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction("reports")}
          >
            <Text style={styles.actionButtonText}>Báo cáo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <AdminBottomTab />  {/* Đây là nơi sử dụng AdminBottomTab làm thanh điều hướng dưới cùng */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base, // Nền chính
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: colors.green, // Màu header xanh lá
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
