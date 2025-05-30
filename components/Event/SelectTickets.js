import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../utils/colors";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "react-native";
import CustomHeader from "../CustomHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SelectTickets = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, tickets: initialTickets } = route.params; // Lấy tickets từ route.params
  const [event, setEvent] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    console.log("Initial tickets:", initialTickets); // Debug dữ liệu ban đầu
    fetchEventDetails();
    if (initialTickets && Array.isArray(initialTickets)) {
      const initialSelectedTickets = {};
      initialTickets.forEach((ticket) => {
        initialSelectedTickets[ticket.id] = 0;
      });
      setSelectedTickets(initialSelectedTickets);
    } else {
      console.warn("Tickets is not an array or undefined:", initialTickets);
    }
  }, [initialTickets]); // Thêm initialTickets làm dependency

  const insets = useSafeAreaInsets();

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
        Alert.alert("Lỗi", data.message || "Không thể tải chi tiết sự kiện");
      }
    } catch (err) {
      console.error("Lỗi fetchEventDetails:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải chi tiết sự kiện.");
    } finally {
      setLoadingEvent(false);
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

  const updateTicketQuantity = (ticketId, delta) => {
    setSelectedTickets((prev) => {
      const newQuantity = Math.max(0, (prev[ticketId] || 0) + delta);
      const updated = { ...prev, [ticketId]: newQuantity };

      let newTotal = 0;
      if (initialTickets && Array.isArray(initialTickets)) {
        initialTickets.forEach((ticket) => {
          if (updated[ticket.id]) {
            newTotal += updated[ticket.id] * parseFloat(ticket.price);
          }
        });
      }
      setTotalPrice(newTotal);

      return updated;
    });
  };

  const handleContinue = () => {
    if (Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0) === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một vé.");
      return;
    }
    navigation.navigate("TicketInfo", { eventId, tickets: initialTickets, selectedTickets, totalPrice, eventName: event.name });
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.green} barStyle="light-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
        <CustomHeader title="Đặt vé" />
      </View>
      <View style={styles.stepper}>
        <Text style={[styles.stepText, styles.stepActive]}>Chọn vé</Text>
        <Text style={styles.stepText}>Thông tin</Text>
        <Text style={styles.stepText}>Thanh toán</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          {/* Thông tin sự kiện */}
          <Text style={styles.eventTitle}>{event.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.white} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.white }]}>{event.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.white} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.green }]}>
              {formatDate(event.date)}
            </Text>
          </View>

          {/* Danh sách vé */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn vé</Text>
            {initialTickets && Array.isArray(initialTickets) && initialTickets.length > 0 ? (
              initialTickets.map((ticket) => (
                <View key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketType}>{getTicketClassDisplay(ticket.ticket_class)}</Text>
                    <Text style={[styles.ticketPrice, { color: colors.green }]}>
                      {formatPrice(ticket.price)}
                    </Text>
                  </View>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      onPress={() => updateTicketQuantity(ticket.id, -1)}
                      disabled={selectedTickets[ticket.id] === 0}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={24}
                        color={selectedTickets[ticket.id] === 0 ? colors.secondary : colors.green}
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{selectedTickets[ticket.id] || 0}</Text>
                    <TouchableOpacity onPress={() => updateTicketQuantity(ticket.id, 1)}>
                      <Ionicons name="add-circle-outline" size={24} color={colors.green} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.errorText}>Không có vé nào để chọn.</Text>
            )}
          </View>

          {/* Tổng tiền */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={[styles.totalPrice, { color: colors.green }]}>
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    paddingVertical: 10,
  },
  stepText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.5,
  },
  stepActive: {
    opacity: 1,
    fontWeight: "bold",
    color: colors.green,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 15,
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
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  ticketCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  ticketInfo: {
    flex: 1,
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
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    color: colors.white,
    marginHorizontal: 10,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 50, // Tăng padding để tránh thanh điều hướng
  },
  continueButton: {
    alignSelf: "flex-end",
    backgroundColor: colors.green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
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
});

export default SelectTickets;