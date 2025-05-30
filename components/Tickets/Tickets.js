import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation, useRoute } from "@react-navigation/native"; // Thêm useRoute
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import CustomHeader from "../CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatusBar } from "react-native";

const Tickets = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Thêm useRoute để nhận tham số
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState("");

  useEffect(() => {
    fetchTicketHistory(); // Gọi lần đầu khi vào màn hình
  }, []);

  useEffect(() => {
    const { refresh } = route.params || {}; // Nhận tham số refresh
    if (refresh) {
      fetchTicketHistory(); // Tải lại dữ liệu nếu có refresh
    }
  }, [route.params]); // Phụ thuộc vào route.params

  const fetchTicketHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://mynameisgiao.pythonanywhere.com/current-user/ticket-history/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
          },
        }
      );

      if (!response.ok) {
        setTickets([
          {
            ticket_id: 1,
            event: {
              id: 1,
              title: "Hòa nhạc Sơn Tùng M-TP",
              date: "2025-06-01T19:00:00Z",
              location: "Sân vận động Mỹ Đình, Hà Nội",
            },
            tickets: [
              { id: 1, type: "VIP", quantity: 2, price: 1500000 },
              { id: 2, type: "Thường", quantity: 1, price: 500000 },
            ],
            total_price: 3500000,
            status: "PAID",
            qr_code: "QR-123-1-1698771234567",
            created_at: "2025-05-30T15:00:00Z",
          },
        ]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTickets(data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi fetchTicketHistory:", err);
      setTickets([
        {
          ticket_id: 1,
          event: {
            id: 1,
            title: "Hòa nhạc Sơn Tùng M-TP",
            date: "2025-06-01T19:00:00Z",
            location: "Sân vận động Mỹ Đình, Hà Nội",
          },
          tickets: [
            { id: 1, type: "VIP", quantity: 2, price: 1500000 },
            { id: 2, type: "Thường", quantity: 1, price: 500000 },
          ],
          total_price: 3500000,
          status: "PAID",
          qr_code: "QR-123-1-1698771234567",
          created_at: "2025-05-30T15:00:00Z",
        },
      ]);
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    Alert.alert(
      "Xác nhận hủy vé",
      "Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              const response = await fetch(
                `https://mynameisgiao.pythonanywhere.com/bookings/${ticketId}/cancel/`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Lỗi", errorData.detail || "Không thể hủy vé. Vui lòng thử lại.");
                return;
              }

              setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                  ticket.ticket_id === ticketId
                    ? { ...ticket, status: "CANCELLED" }
                    : ticket
                )
              );
              Alert.alert("Thành công", "Hủy vé thành công!");
            } catch (err) {
              console.error("Lỗi handleCancelTicket:", err);
              Alert.alert("Lỗi", "Không thể hủy vé. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));

  const renderTicketItem = ({ item }) => (
  <View style={styles.ticketCard}>
    <Text style={styles.eventTitle}>
      {item.event && item.event.title ? item.event.title : "Không có tên sự kiện"}
    </Text>
    <Text style={styles.eventDetail}>
      <Ionicons name="calendar-outline" size={16} color={colors.white} />{" "}
      {item.event && item.event.date ? formatDate(item.event.date) : "Không rõ ngày"}
    </Text>
    <Text style={styles.eventDetail}>
      <Ionicons name="location-outline" size={16} color={colors.white} />{" "}
      {item.event && item.event.location ? item.event.location : "Không rõ địa điểm"}
    </Text>
      <Text style={styles.ticketInfo}>
        Số lượng vé: {Array.isArray(item.tickets) ? item.tickets.reduce((sum, t) => sum + t.quantity, 0) : 0}
      </Text>
      <Text style={styles.ticketInfo}>
        Loại vé: {Array.isArray(item.tickets) ? item.tickets.map((t) => `${t.type} (${t.quantity})`).join(", ") : "Không rõ"}
      </Text>
      <Text style={styles.ticketInfo}>
        Tổng tiền: {formatPrice(item.total_price)}
      </Text>
      <Text style={[styles.status, { color: item.status === "PAID" ? colors.green : colors.red }]}>
        Trạng thái: {item.status === "PAID" ? "Đã thanh toán" : item.status === "CANCELLED" ? "Đã hủy" : "Đã sử dụng"}
      </Text>

      {item.qr_code && item.status === "PAID" && (
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => {
            setSelectedQrCode(item.qr_code);
            setModalVisible(true);
          }}
        >
          <Text style={styles.qrButtonText}>Xem mã QR</Text>
        </TouchableOpacity>
      )}

      {item.status === "PAID" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelTicket(item.ticket_id)}
        >
          <Text style={styles.cancelButtonText}>Hủy vé</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.green} barStyle="light-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
        <CustomHeader title="Vé của tôi" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có vé nào!</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.exploreButtonText}>Khám phá sự kiện</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item, index) => (item.ticket_id ? item.ticket_id.toString() : index.toString())}
          contentContainerStyle={styles.ticketList}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mã QR của bạn</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={selectedQrCode}
                size={200}
                color={colors.base}
                backgroundColor={colors.white}
              />
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  ticketList: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  eventDetail: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 5,
  },
  ticketInfo: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 5,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  qrButton: {
    backgroundColor: colors.green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.red,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: colors.green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.base,
    marginBottom: 15,
  },
  qrCodeContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  modalButton: {
    backgroundColor: colors.green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
});

export default Tickets;