import React, { useState, useEffect } from "react";
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

const TicketInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, tickets, selectedTickets, totalPrice } = route.params;
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút tính bằng giây

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

  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    navigation.navigate("Payment", { eventId, tickets, selectedTickets, totalPrice });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.green} barStyle="light-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
      <CustomHeader title="Đặt vé" />
      </View>
      <View style={styles.stepper}>
        <Text style={styles.stepText}>Chọn vé</Text>
        <Text style={[styles.stepText, styles.stepActive]}>Thông tin</Text>
        <Text style={styles.stepText}>Thanh toán</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={styles.timerText}>
            Hoàn tất đặt vé trong <Text style={{ color: colors.green }}>{formatTime(timeLeft)}</Text>
          </Text>
          {/* Thêm form thông tin sau (tạm thời để trống) */}
          <Text style={styles.infoText}>Vui lòng điền thông tin của bạn (tạm thời).</Text>
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
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
});

export default TicketInfo;