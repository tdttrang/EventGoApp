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
import { SafeAreaView } from "react-native-safe-area-context"; // Đã cài đặt
import { colors } from "../../utils/colors";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomHeader from "../CustomHeader";
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
  }, []);

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
        Alert.alert("Lỗi", data.message || "Không thể tải danh sách vé");
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={colors.green} barStyle="light-content" />
      <CustomHeader title="Chi tiết sự kiện" />
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
            onPress={() => navigation.navigate("BookTicket", { eventId: event.id, tickets })}
          >
            <Text style={styles.buyButtonText}>Mua vé ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    position: "relative",
    height: 300,
  },
  headerImage: {
    width: "100%",
    height: "100%",
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
  description: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 24,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
    paddingVertical: 15,
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
    marginBottom: 10,
  },
  buttonSafeArea: {
    backgroundColor: colors.base,
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
  },
});

export default EventDetails;