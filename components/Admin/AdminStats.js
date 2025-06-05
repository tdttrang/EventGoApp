import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../configs/Apis";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/colors";

const AdminStats = () => {
  const [adminStats, setAdminStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    monthlyData: [],
    quarterlyData: [],
  });

  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        const api = authApi(token);

        const eventsRes = await api.get(endpoints["events"]);
        const totalEvents = eventsRes.data.count || 0;

        const attendeesRes = await api.get(endpoints["total_attendees"]);
        const totalAttendees = attendeesRes.data.total || 0;

        const statsRes = await api.get(endpoints["stats_by_time"]);
        const monthlyData = statsRes.data.monthly || [];
        const quarterlyData = statsRes.data.quarterly || [];

        setAdminStats({
          totalEvents,
          totalAttendees,
          monthlyData,
          quarterlyData,
        });
      } catch (error) {
        console.error("Lỗi khi lấy báo cáo:", error);
      }
    };
    fetchData();
  }, []);

  const monthlyChartData = {
    labels: adminStats.monthlyData.map(
      (item) => item.month || `Tháng ${item.month_num}`
    ),
    datasets: [{ data: adminStats.monthlyData.map((item) => item.count || 0) }],
  };

  const quarterlyChartData = {
    labels: adminStats.quarterlyData.map(
      (item) => item.quarter || `Quý ${item.quarter_num}`
    ),
    datasets: [
      { data: adminStats.quarterlyData.map((item) => item.count || 0) },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 60 + insets.top },
        ]}
      >
        <Text style={styles.headerTitle}>Báo cáo Quản trị</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Tổng số sự kiện</Text>
          <Text style={styles.statValue}>{adminStats.totalEvents}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Tổng số người tham dự</Text>
          <Text style={styles.statValue}>{adminStats.totalAttendees}</Text>
        </View>

        <Text style={styles.chartTitle}>Số người tham gia theo tháng</Text>
        <LineChart
          data={monthlyChartData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 177, 79, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
        />

        <Text style={styles.chartTitle}>Số người tham gia theo quý</Text>
        <LineChart
          data={quarterlyChartData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 177, 79, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: colors.white,
    fontFamily: "Bold",
    textAlign: "center",
  },
  scrollContent: { padding: 20 },
  statBox: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  statTitle: { color: colors.secondary, fontSize: 16, fontFamily: "SemiBold" },
  statValue: { color: colors.green, fontSize: 20, fontFamily: "Bold" },
  chartTitle: {
    color: colors.white,
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "SemiBold",
  },
  chart: { marginVertical: 8, borderRadius: 16 },
});

export default AdminStats;
