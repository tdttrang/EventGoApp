import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../configs/Apis";

const OrganizerDashboard = ({ route }) => {
  const { eventId } = route.params || { eventId: 2 }; // Giá trị mặc định nếu không có params
  const [stats, setStats] = useState({
    ticketsSold: 0,
    revenue: 0,
    feedback: [],
  });

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        const api = authApi(token);

        // Lấy số vé đã bán
        const soldTicketsRes = await api.get(
          endpoints["sold_tickets"](eventId)
        );
        const ticketsSold = soldTicketsRes.data.count || 0;

        // Lấy tổng doanh thu
        const revenueRes = await api.get(endpoints["total_revenue"](eventId));
        const revenue = revenueRes.data.total || 0;

        // Lấy danh sách phản hồi
        const reviewsRes = await api.get(
          endpoints["event-review-list"](eventId)
        );
        const feedback = reviewsRes.data.results || [];

        setStats({ ticketsSold, revenue, feedback });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };
    fetchData();
  }, [eventId]);

  // Dữ liệu cho biểu đồ (giả lập dựa trên số vé đã bán, có thể lấy từ API nếu có)
  const chartData = {
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
    datasets: [
      {
        data: [
          Math.floor(stats.ticketsSold * 0.2),
          Math.floor(stats.ticketsSold * 0.3),
          Math.floor(stats.ticketsSold * 0.25),
          Math.floor(stats.ticketsSold * 0.15),
          Math.floor(stats.ticketsSold * 0.1),
        ],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Thống kê Sự kiện</Text>

      <View style={styles.statBox}>
        <Text style={styles.statTitle}>Số vé đã bán</Text>
        <Text style={styles.statValue}>{stats.ticketsSold}</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statTitle}>Doanh thu (VNĐ)</Text>
        <Text style={styles.statValue}>{stats.revenue.toLocaleString()}</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statTitle}>Phản hồi</Text>
        {stats.feedback.length > 0 ? (
          stats.feedback.map((item) => (
            <View key={item.id} style={styles.feedbackItem}>
              <Text style={styles.feedbackText}>{item.comment}</Text>
              <Text style={styles.rating}>Đánh giá: {item.rating}/5</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Chưa có phản hồi</Text>
        )}
      </View>

      <Text style={styles.chartTitle}>Số vé bán theo ngày (ước lượng)</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#1C2526",
          backgroundGradientFrom: "#1C2526",
          backgroundGradientTo: "#1C2526",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 177, 79, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C2526", padding: 10 },
  header: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#2C3E50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  statTitle: { color: "#B0BEC5", fontSize: 16 },
  statValue: { color: "#00B14F", fontSize: 20, fontWeight: "bold" },
  feedbackItem: { marginTop: 10 },
  feedbackText: { color: "#FFFFFF" },
  rating: { color: "#B0BEC5", fontSize: 14 },
  noData: { color: "#B0BEC5", fontSize: 14 },
  chartTitle: { color: "#FFFFFF", fontSize: 18, marginBottom: 10 },
  chart: { marginVertical: 8, borderRadius: 16 },
});

export default OrganizerDashboard;
