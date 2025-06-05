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
  StatusBar,
} from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import CustomHeader from "../CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tickets = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState("");
  const [expandedTicketIds, setExpandedTicketIds] = useState([]); // Lưu ticket đang mở rộng

  useEffect(() => {
    fetchTicketHistory();
  }, []);

  useEffect(() => {
    const { refresh } = route.params || {};
    if (refresh) {
      fetchTicketHistory();
    }
  }, [route.params]);

  const fetchTicketHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(
        "https://mynameisgiao.pythonanywhere.com/current-user/ticket-history/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.log("Lỗi tải vé:", errText);
        Alert.alert("Lỗi", "Không thể tải vé.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const rawTickets = data.results;
      setTickets(rawTickets);
    } catch (e) {
      console.error("Lỗi tải vé:", e);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải vé.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    Alert.alert("Xác nhận hủy vé", "Bạn có chắc chắn muốn hủy vé này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Có",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("access");
            const response = await fetch(
              `https://mynameisgiao.pythonanywhere.com/bookings/${ticketId}/cancel/`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.log("Cancel error (raw):", errorText);
              Alert.alert(
                "Lỗi",
                "Không thể hủy vé.\n" + errorText.substring(0, 200)
              );
              return;
            }

            setTickets((prev) =>
              prev.map((t) =>
                t.id === ticketId ? { ...t, status: "CANCELLED" } : t
              )
            );
            Alert.alert("Thành công", "Đã hủy vé.");
          } catch (err) {
            console.error("Cancel error:", err);
            Alert.alert("Lỗi", "Không thể kết nối.");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Không rõ ngày";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const toggleExpand = (ticketId) => {
    setExpandedTicketIds((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const renderTicketItem = ({ item }) => {
    console.log(
      "Render ticket:",
      item.id,
      "Status:",
      item.status,
      "QR code:",
      item.qr_code
    );
    
    const event = item.ticket?.event || {};

    const qrValue =
      item.qr_code_url ||
      `https://myapp.com/event-detail/${event.id || "unknown"}`;

    console.log("Ticket full:", item); // <-- đặt ở đây để xem dữ liệu vé

    const totalPrice =
      item.total_price || item.quantity * (item.ticket?.price || 0);

    const isExpanded = expandedTicketIds.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
        style={styles.ticketCard}
      >
        {/* Tiêu đề rút gọn */}
        <View style={styles.rowSpaceBetween}>
          <Text style={styles.eventTitle}>
            {event.name || "Không rõ sự kiện"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={24}
            color={colors.white}
          />
        </View>

        <Text style={styles.eventDetail}>
          <Ionicons name="calendar-outline" size={16} color={colors.white} />{" "}
          {formatDate(event.date)}
        </Text>

        <Text style={styles.ticketInfo}>Số lượng vé: {item.quantity || 0}</Text>

        {/* Chi tiết mở rộng */}
        {isExpanded && (
          <View
            style={{
              marginTop: 15,
              borderTopWidth: 1,
              borderTopColor: "#66bb6a",
              paddingTop: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.eventDetail}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.white}
                />{" "}
                {event.location || "Không rõ địa điểm"}
              </Text>
              <Text
                style={[
                  styles.eventDetail,
                  {
                    fontWeight: "bold",
                    color:
                      item.status.toLowerCase() === "paid"
                        ? "#432h50"
                        : item.status.toLowerCase() === "cancelled"
                        ? "#f44336"
                        : "#ff9800",
                  },
                ]}
              >
                [{item.status.toLowerCase()}]
              </Text>
            </View>

            <Text style={styles.ticketInfo}>
              Tổng tiền:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(
                item.total_price || item.quantity * (item.ticket?.price || 0)
              )}
            </Text>

            {/* Sửa phần hiển thị nút QR và nút hủy để sử dụng qrValue */}
            {item.status.toLowerCase() === "paid" && (
              <>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => {
                    setSelectedQrCode(qrValue);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.qrButtonText}>Xem mã QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelTicket(item.id)}
                >
                  <Text style={styles.cancelButtonText}>Hủy vé</Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === "CANCELLED" && (
              <Text
                style={[
                  styles.ticketInfo,
                  { color: colors.red, marginTop: 10 },
                ]}
              >
                Vé đã bị hủy
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.ticketList}
        />
      )}

      {/* Modal QR */}
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
    backgroundColor: "#2E7D32", // xanh lá tươi hơn (dark green)
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    flexShrink: 1,
  },
  eventDetail: {
    fontSize: 15,
    color: colors.white,
    marginTop: 6,
  },
  ticketInfo: {
    fontSize: 15,
    color: colors.white,
    marginTop: 6,
  },
  qrButton: {
    backgroundColor: colors.green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
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
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginTop: 5,
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
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Tickets;
