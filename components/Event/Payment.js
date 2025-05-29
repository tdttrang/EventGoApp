import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "react-native";
import CustomHeader from "../CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";


const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, tickets, selectedTickets, totalPrice } = route.params;
  const [selectedPayment, setSelectedPayment] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));

  const insets = useSafeAreaInsets();
  const handleBookTicket = async (paymentMethod) => {
    Alert.alert("Thanh toán", `Đang xử lý thanh toán qua ${paymentMethod}...`);
    const response = await fetch(
      `https://mynameisgiao.pythonanywhere.com/events/${eventId}/book/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          tickets: Object.keys(selectedTickets)
            .filter((ticketId) => selectedTickets[ticketId] > 0)
            .map((ticketId) => ({
              ticket_id: parseInt(ticketId),
              quantity: selectedTickets[ticketId],
            })),
          payment_method: paymentMethod,
        }),
      }
    );

    

    const data = await response.json();
    if (response.ok) {
      const bookingId = data.booking_id;
      const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
      Alert.alert(
        "Thành công",
        `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
        [
          {
            text: "OK",
            onPress: () => {
              Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert("Lỗi", data.message || "Không thể đặt vé. Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.green} barStyle="light-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
      <CustomHeader title="Đặt vé" />
      </View>
      <View style={styles.stepper}>
        <Text style={styles.stepText}>Chọn vé</Text>
        <Text style={styles.stepText}>Thông tin</Text>
        <Text style={[styles.stepText, styles.stepActive]}>Thanh toán</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={styles.eventTitle}>Thông tin thanh toán</Text>
          <View style={styles.ticketSummary}>
            <Text style={styles.ticketSummaryText}>
              Tổng số vé: {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)}
            </Text>
            <Text style={[styles.ticketSummaryText, { color: colors.green }]}>
              Tổng tiền: {formatPrice(totalPrice)}
            </Text>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPayment("VNPAY")}
            >
              <View style={styles.radioCircle}>
                {selectedPayment === "VNPAY" && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.paymentOptionText}>VNPAY/Ứng dụng ngân hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPayment("CreditCard")}
            >
              <View style={styles.radioCircle}>
                {selectedPayment === "CreditCard" && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.paymentOptionText}>Thẻ tín dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedPayment && styles.disabledButton]}
          onPress={() => selectedPayment && handleBookTicket(selectedPayment)}
          disabled={!selectedPayment}
        >
          <Text style={styles.continueButtonText}>Thanh toán</Text>
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
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 15,
  },
  ticketSummary: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  ticketSummaryText: {
    fontSize: 16,
    color: colors.white,
  },
  paymentMethod: {
    marginTop: 20,
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
  },
  paymentOptionText: {
    fontSize: 16,
    color: colors.white,
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
  disabledButton: {
    backgroundColor: colors.secondary,
  },
});

export default Payment;