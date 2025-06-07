import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../configs/Apis";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const AdminStats = () => {
  const [adminStats, setAdminStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    monthlyData: [],
    quarterlyData: [],
    attendeesMonthlyData: [],
    attendeesQuarterlyData: [],
  });

  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("access");
        if (!token) {
          console.error("No access token found");
          return;
        }
        const api = authApi(token);

        // Lấy tổng số sự kiện
        const eventsRes = await api.get(endpoints["event_total"]);
        const totalEvents = eventsRes.data.count || eventsRes.data.length || 0;

        // Lấy tổng số người tham gia
        const attendeesRes = await api.get(endpoints["total_attendees"]);
        const totalAttendees = attendeesRes.data.total_attendees || 0;

        // chart theo tháng và quý
        const currentYear = moment().year();
        const months = [];

        for (let m = 0; m < 12; m++) {
          const monthMoment = moment()
            .year(currentYear)
            .month(m)
            .startOf("month");
          const startDate = monthMoment.format("YYYY-MM-DD");
          const endDate = monthMoment.endOf("month").format("YYYY-MM-DD");
          months.push({ startDate, endDate });
        }
        // Tạo mảng các quý
        const quarters = [
          {
            label: "Q1",
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-03-31`,
          },
          {
            label: "Q2",
            startDate: `${currentYear}-04-01`,
            endDate: `${currentYear}-06-30`,
          },
          {
            label: "Q3",
            startDate: `${currentYear}-07-01`,
            endDate: `${currentYear}-09-30`,
          },
          {
            label: "Q4",
            startDate: `${currentYear}-10-01`,
            endDate: `${currentYear}-12-31`,
          },
        ];

        // chart sự kiện
        const monthlyPromises = months.map(async ({ startDate, endDate }) => {
          try {
            const res = await api.get(endpoints["event_time_statistics"], {
              params: {
                time_unit: "month",
                start_date: startDate,
                end_date: endDate,
              },
            });

            if (res.data.count !== undefined) {
              return { month: startDate, count: res.data.count };
            } else if (Array.isArray(res.data) && res.data.length > 0) {
              return res.data[0] || { month: startDate, count: 0 };
            } else {
              return { month: startDate, count: 0 };
            }
          } catch (error) {
            console.error(
              `❌ Lỗi khi gọi API cho ${startDate} đến ${endDate}:`,
              error.response?.data || error.message
            );
            return { month: startDate, count: 0 };
          }
        });

        const monthlyData = await Promise.all(monthlyPromises);

        // Gọi API theo từng quý
        const quarterlyPromises = quarters.map(
          async ({ label, startDate, endDate }) => {
            console.log(`📅 Đang xử lý ${label}: ${startDate} đến ${endDate}`);
            try {
              const res = await api.get(endpoints["event_time_statistics"], {
                params: {
                  time_unit: "quarter",
                  start_date: startDate,
                  end_date: endDate,
                },
              });
              console.log(`✅ API Response for ${label}:`, res.data);
              const count =
                res.data?.count ??
                (Array.isArray(res.data) && res.data.length > 0
                  ? res.data[0]?.count
                  : 0);
              return { quarter: label, count: count || 0 };
            } catch (error) {
              console.error(
                `❌ Lỗi khi gọi API cho ${label}:`,
                error.response?.data || error.message
              );
              return { quarter: label, count: 0 };
            }
          }
        );

        const quarterlyData = await Promise.all(quarterlyPromises);

        // chart attendees
        const att_monthlyPromises = months.map(
          async ({ startDate, endDate }) => {
            try {
              const res = await api.get(
                endpoints["attendees_time_statistics"],
                {
                  params: {
                    time_unit: "month",
                    start_date: startDate,
                    end_date: endDate,
                  },
                }
              );

              if (res.data.count !== undefined) {
                return { month: startDate, count: res.data.count };
              } else if (Array.isArray(res.data) && res.data.length > 0) {
                return {
                  month: startDate,
                  count: res.data[0]?.attendee_count || 0, // SỬA ở đây
                };
              } else {
                return { month: startDate, count: 0 };
              }
            } catch (error) {
              console.error(
                `❌ Lỗi khi gọi API cho ${startDate} đến ${endDate}:`,
                error.response?.data || error.message
              );
              return { month: startDate, count: 0 };
            }
          }
        );
        const att_monthlyData = await Promise.all(att_monthlyPromises);

        const att_quarterlyPromises = quarters.map(
          async ({ label, startDate, endDate }) => {
            console.log(
              `📅 Đang xử lý user${label}: ${startDate} đến ${endDate}`
            );
            try {
              const res = await api.get(
                endpoints["attendees_time_statistics"],
                {
                  params: {
                    time_unit: "quarter",
                    start_date: startDate,
                    end_date: endDate,
                  },
                }
              );
              console.log(`✅ API Response for user ${label}:`, res.data);
              const count =
                res.data?.count ??
                (Array.isArray(res.data) && res.data.length > 0
                  ? res.data[0]?.attendee_count // SỬA ở đây
                  : 0);
              return { quarter: label, count: count || 0 };
            } catch (error) {
              console.error(
                `❌ Lỗi khi gọi API cho user ${label}:`,
                error.response?.data || error.message
              );
              return { quarter: label, count: 0 };
            }
          }
        );
        const att_quarterlyData = await Promise.all(att_quarterlyPromises);

        setAdminStats({
          totalEvents,
          totalAttendees,
          monthlyData,
          quarterlyData,
          attendeesMonthlyData: att_monthlyData,
          attendeesQuarterlyData: att_quarterlyData,
        });
      } catch (error) {
        console.error(
          "Lỗi khi lấy báo cáo:",
          error.response?.data || error.message
        );
      }
    };
    fetchData();
  }, []);

  const monthlyChartData = {
    labels: adminStats.monthlyData
      .map((item) => `${moment(item.month).format("MMM")}`) // Cập nhật định dạng tháng
      .filter((label) => label && label.trim()),
    datasets: [
      {
        data: adminStats.monthlyData.map((item) => item.count || 0),
      },
    ],
  };

  const quarterlyChartData = {
    labels: adminStats.quarterlyData.map((item) => item.quarter), // ["Q1", "Q2", "Q3", "Q4"]
    datasets: [
      {
        data: adminStats.quarterlyData.map((item) => item.count || 0),
      },
    ],
  };

  const att_monthlyChartData = {
    labels: adminStats.attendeesMonthlyData
      .map((item) => `${moment(item.month).format("MMM")}`) // Cập nhật định dạng tháng
      .filter((label) => label && label.trim()),
    datasets: [
      {
        data: adminStats.attendeesMonthlyData.map((item) => item.count || 0),
      },
    ],
  };

  const att_quarterlyChartData = {
    labels: adminStats.attendeesQuarterlyData.map((item) => item.quarter), // ["Q1", "Q2", "Q3", "Q4"]
    datasets: [
      {
        data: adminStats.attendeesQuarterlyData.map((item) => item.count || 0),
      },
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo thống kê</Text>
        <View style={{ width: 24 }} />
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

        <Text style={styles.chartTitle}>Số sự kiện theo tháng</Text>
        {monthlyChartData.labels.length > 0 ? (
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
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
                paddingRight: 10,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu để hiển thị</Text>
        )}

        {/* Biểu đồ theo quý */}
        <Text style={styles.chartTitle}>Số sự kiện theo quý</Text>
        {quarterlyChartData.labels.length > 0 ? (
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
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
                paddingRight: 10,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#007BFF",
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu để hiển thị</Text>
        )}

        {/* attandee */}

        <Text style={styles.chartTitle}>Số khán giả theo tháng</Text>
        {att_monthlyChartData.labels.length > 0 ? (
          <LineChart
            data={att_monthlyChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 177, 79, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
                paddingRight: 10,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu để hiển thị</Text>
        )}

        <Text style={styles.chartTitle}>Số khán giả theo quý</Text>
        {att_quarterlyChartData.labels.length > 0 ? (
          <LineChart
            data={att_quarterlyChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
                paddingRight: 10,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#007BFF",
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu để hiển thị</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: colors.white,
    fontFamily: "Bold",
    flex: 1,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    color: colors.secondary,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "SemiBold",
    marginVertical: 8,
  },
});

export default AdminStats;
