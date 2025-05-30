import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../utils/colors"; // Đảm bảo đường dẫn đúng
import { fonts } from "../../utils/fonts"; // Đảm bảo đường dẫn đúng
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomHeader from "../CustomHeader"; // Đảm bảo đường dẫn đúng
import Ionicons from "react-native-vector-icons/Ionicons";

const EventDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    fetchEventDetails();
    fetchTickets();
  }, [eventId]); // Thêm eventId vào dependency array để fetch lại khi eventId thay đổi

  const fetchEventDetails = async () => {
    setLoadingEvent(true);
    try {
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/${eventId}/`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setEvent(data);
      } else {
        // Cải thiện thông báo lỗi nếu có
        const errorMessage = data.detail || data.message || "Không thể tải chi tiết sự kiện";
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (err) {
      console.error("Lỗi fetchEventDetails:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải chi tiết sự kiện.");
    } finally {
      setLoadingEvent(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/${eventId}/tickets/`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        const errorMessage = data.detail || data.message || "Không thể tải danh sách vé";
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (err) {
      console.error("Lỗi fetchTickets:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải danh sách vé.");
    } finally {
      setLoadingTickets(false);
    }
  };

  const formatDate = (date) => moment(date).format("DD/MM/YYYY HH:mm");
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));

  const getTicketClassDisplay = (ticketClass) => {
    const ticketChoices = {
      normal: "Vé thường",
      VIP: "Vé VIP",
    };
    return ticketChoices[ticketClass] || ticketClass;
  };

  if (loadingEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.green} style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Không tìm thấy sự kiện.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* View này phủ màu xanh lên StatusBar */}
      <View style={{
        height: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        backgroundColor: colors.green,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={colors.green} barStyle="light-content" translucent={true} />
        {/* CustomHeader sẽ tự động xử lý nút back và title */}
        <CustomHeader title={event.name} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: event.media_url || "https://via.placeholder.com/300" }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.green }]}>
                {formatDate(event.date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.white }]}>
                {event.location}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.green }]}>
                Từ {formatPrice(event.min_price)} - {formatPrice(event.max_price)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chi tiết sự kiện</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            {/* === PHẦN ĐÁNH GIÁ & BÌNH LUẬN MỚI THÊM === */}
            <View style={styles.section}>
              <Text style={styles.reviewsSectionTitle}>Đánh giá & Bình luận</Text>
              <View style={styles.averageRatingContainer}>
                <Ionicons name="star" size={24} color={colors.green} />
                <Text style={styles.averageRatingText}>
                  {event.average_rating !== null &&
                  event.average_rating !== undefined &&
                  event.average_rating !== "null" &&
                  event.average_rating !== "" &&
                  !isNaN(Number(event.average_rating))
                    ? Number(event.average_rating).toFixed(1)
                    : "Chưa có"}
                </Text>
                <Text style={styles.totalReviewsText}>
                  ({event.review_count || 0} đánh giá)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewReviewsButton}
                onPress={() => navigation.navigate('Reviews', { eventId: event.id })}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={colors.white} />
                <Text style={styles.viewReviewsButtonText}>Xem tất cả đánh giá</Text>
              </TouchableOpacity>
            </View>
            {/* === HẾT PHẦN ĐÁNH GIÁ & BÌNH LUẬN === */}


            {loadingTickets ? (
              <ActivityIndicator size="small" color={colors.green} style={styles.loading} />
            ) : tickets.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh sách vé</Text>
                {tickets.map((ticket) => (
                  <View key={ticket.id} style={styles.ticketCard}>
                    <Text style={styles.ticketType}>{getTicketClassDisplay(ticket.ticket_class)}</Text>
                    <Text style={[styles.ticketPrice, { color: colors.green }]}>
                      {formatPrice(ticket.price)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Không có vé nào khả dụng.</Text>
            )}
          </View>
        </ScrollView>

        <SafeAreaView style={styles.buttonSafeArea} edges={["bottom"]}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => navigation.navigate("SelectTickets", { eventId: event.id, tickets })}
            >
              <Text style={styles.buyButtonText}>Mua vé ngay</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base, // Nền chung của màn hình
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Đảm bảo đủ khoảng trống cho nút mua vé cố định ở dưới
  },
  headerContainer: {
    width: "100%",
    height: 300, // Chiều cao ảnh bìa
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginTop: -50, // Kéo lên trên ảnh bìa để tạo hiệu ứng
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold", // Đã có fontWeight, không cần dùng fonts.Bold nếu bạn dùng default font
    color: colors.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    // fontFamily: fonts.Regular, // Dùng nếu muốn tùy chỉnh font
    color: colors.white, // Đặt màu mặc định là trắng
  },
  section: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold", // Đã có fontWeight, không cần dùng fonts.SemiBold
    color: colors.white,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 24,
  },
  ticketCard: {
    backgroundColor: colors.base, // Đổi sang base để có sự phân biệt với card chung
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray, // Thêm viền nhẹ
  },
  ticketType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  ticketPrice: {
    fontSize: 14,
    marginVertical: 5,
  },
  buyButton: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  buttonSafeArea: {
    backgroundColor: colors.base, // Nền cho khu vực nút mua vé
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: colors.white,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center', // Canh giữa văn bản này
  },
  // === STYLES MỚI CHO PHẦN ĐÁNH GIÁ ===
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold', // Dùng fontWeight để đồng bộ với các title khác nếu không dùng fonts.Bold
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  averageRatingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.green,
    marginLeft: 10,
    marginRight: 5,
  },
  totalReviewsText: {
    fontSize: 16,
    // fontFamily: fonts.Regular, // Dùng nếu muốn tùy chỉnh font
    color: colors.secondary,
  },
  viewReviewsButton: {
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  viewReviewsButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default EventDetails;