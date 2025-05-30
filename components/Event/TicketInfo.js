import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView
} from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "react-native";
import CustomHeader from "../CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const TicketInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, tickets, selectedTickets, totalPrice, eventName } = route.params;
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút tính bằng giây
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      Alert.alert("Thông báo", "Thời gian đặt vé đã hết. Vui lòng chọn lại.", [
        { text: "OK", onPress: () => navigation.navigate("SelectTickets", { eventId, tickets }) },
      ]);
    }
  }, [timeLeft, navigation, eventId, tickets]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10 chữ số.");
      return false;
    }

    if (!formData.phone.startsWith("0")) {
    Alert.alert("Lỗi", "Số điện thoại phải bắt đầu bằng số 0.");
    return false;
  }

    // Kiểm tra không được là dãy số liên tiếp tăng hoặc giảm
    const phone = formData.phone;
    let isConsecutive = true;
    let isReverseConsecutive = true;
    for (let i = 1; i < phone.length; i++) {
      // Tăng liên tiếp: 9->0 cũng tính là liên tiếp
      if ((parseInt(phone[i]) !== (parseInt(phone[i - 1]) + 1) % 10)) isConsecutive = false;
      // Giảm liên tiếp: 0->9 cũng tính là liên tiếp giảm
      if ((parseInt(phone[i]) !== (parseInt(phone[i - 1]) + 9) % 10)) isReverseConsecutive = false;
    }
    if (isConsecutive || isReverseConsecutive) {
      Alert.alert("Lỗi", "Số điện thoại không được là dãy số liên tiếp.");
      return false;
    }

    if (!formData.agree) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản mua vé.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
  if (!validateForm()) return;
  if (!selectedTickets || typeof selectedTickets !== "object" || Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0) === 0) {
    Alert.alert("Lỗi", "Dữ liệu vé không hợp lệ. Vui lòng chọn lại.");
    navigation.navigate("SelectTickets", { eventId, tickets });
    return;
  }
  navigation.navigate("Payment", { eventId, tickets, selectedTickets, totalPrice, timeLeft, userInfo: { email: formData.email, phone: formData.phone } });
};

  const getTicketClassDisplay = (ticketClass) => {
    const ticketChoices = {
      normal: "Vé thường",
      VIP: "Vé VIP",
    };
    return ticketChoices[ticketClass] || ticketClass;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
    <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
      <CustomHeader title="Đặt vé" />
    </View>
      <View style={styles.stepper}>
        <Text style={styles.stepText}>Chọn vé</Text>
        <Text style={[styles.stepText, styles.stepActive]}>Thông tin</Text>
        <Text style={styles.stepText}>Thanh toán</Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          <Text>Hoàn tất đặt vé trong </Text>
          <Text style={{ color: colors.green }}>{formatTime(timeLeft)}</Text>
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* Form thông tin màu secondary */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Nhập thông tin của bạn</Text>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Số điện thoại</Text>
                <Text style={styles.required}> *</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.secondary}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.required}> *</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor={colors.secondary}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>
                Bạn xác nhận mua vé cho sự kiện "{eventName || "Sự kiện"}"? 
                <Text style={styles.required}> *</Text>               
              </Text>
              
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({ ...formData, agree: !formData.agree })}
              >
                <View style={[
                  styles.checkbox,
                  formData.agree && { backgroundColor: colors.green, borderColor: colors.green }
                ]}>
                  {formData.agree && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.checkboxLabel}>Tôi đồng ý</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form trắng thông tin vé */}
          <View style={styles.whiteForm}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Thông tin đặt vé</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SelectTickets", { eventId, tickets })}>
                <Text style={styles.changeLink}>Chọn lại vé</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ticketInfoContainer}>
              {tickets && Array.isArray(tickets) && tickets.length > 0 ? (
                tickets
                  .filter((ticket) => selectedTickets[ticket.id] > 0)
                  .map((ticket, index) => (
                    <View key={index} style={styles.ticketRow}>
                      <Text style={styles.ticketDetail}>
                        {getTicketClassDisplay(ticket.ticket_class)} x {selectedTickets[ticket.id]}
                      </Text>
                      <Text style={styles.ticketDetail}>
                        {formatPrice(ticket.price * selectedTickets[ticket.id])}
                      </Text>
                    </View>
                  ))
              ) : (
                <Text style={styles.errorText}>Không có vé nào được chọn.</Text>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền tạm tính:</Text>
                <Text style={styles.totalAmount}>
                  {totalPrice ? formatPrice(totalPrice) : "0 đ"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? "Đang xử lý..." : "Tiếp tục"}
          </Text>
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
  timerContainer: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 15,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  timerText: {
    fontSize: 18,
    color: colors.white,
    textAlign: "center",
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  form: {
    backgroundColor: "#454545",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: colors.white,
  },
  required: {
    fontSize: 16,
    color: "red",
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: colors.white,
  },
  confirmContainer: {
    marginVertical: 10,
  },
  confirmText: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: colors.white,
  borderRadius: 12,
  marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent", // mặc định trong suốt
},
  checkboxLabel: {
    fontSize: 16,
    color: colors.white,
  },
  whiteForm: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.base,
  },
  changeLink: {
    fontSize: 16,
    color: colors.green,
  },
  ticketInfoContainer: {
    marginTop: 10,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ticketDetail: {
    fontSize: 16,
    color: colors.base,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.base,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.green,
  },
  errorText: {
    fontSize: 16,
    color: colors.base,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 55,
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
});

export default TicketInfo;