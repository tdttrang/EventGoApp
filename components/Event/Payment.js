// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { colors } from "../../utils/colors";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { StatusBar } from "react-native";
// import CustomHeader from "../CustomHeader";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Tickets from "../Tickets/Tickets"; // Gi


// const Payment = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { eventId, tickets, selectedTickets, totalPrice, timeLeft: initialTimeLeft, userInfo } = route.params;
//   const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 15 * 60); // Tiếp tục từ thời gian còn lại
//   const [selectedPayment, setSelectedPayment] = useState(null);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setInterval(() => {
//         setTimeLeft((prev) => prev - 1);
//       }, 1000);
//       return () => clearInterval(timer);
//     } else {
//       Alert.alert("Thông báo", "Thời gian đặt vé đã hết. Vui lòng chọn lại.", [
//         { text: "OK", onPress: () => navigation.navigate("SelectTickets", { eventId, tickets }) },
//       ]);
//     }
//   }, [timeLeft, navigation, eventId, tickets]);

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
//   };

//   const formatPrice = (price) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(parseFloat(price));

//   const handleBookTicket = async (paymentMethod) => {
//     if (!userInfo || !userInfo.email || !userInfo.phone) {
//       Alert.alert("Lỗi", "Thông tin người dùng không đầy đủ. Vui lòng quay lại bước trước.");
//       return;
//     }

//     Alert.alert("Thanh toán", `Đang xử lý thanh toán qua ${paymentMethod}...`);

//     // Giả lập quy trình thanh toán MoMo
//     if (paymentMethod === "MoMo") {
//       setTimeout(async () => {
//         try {
//           const response = await fetch(
//             `https://mynameisgiao.pythonanywhere.com/events/${eventId}/book/`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
//               },
//               body: JSON.stringify({
//                 event_id: eventId,
//                 tickets: Object.keys(selectedTickets)
//                   .filter((ticketId) => selectedTickets[ticketId] > 0)
//                   .map((ticketId) => ({
//                     id: parseInt(ticketId),
//                     quantity: selectedTickets[ticketId],
//                   })),
//                 user_info: {
//                   email: userInfo.email,
//                   phone: userInfo.phone,
//                 },
//                 payment_method: paymentMethod,
//               }),
//             }
//           );

//           // Kiểm tra nếu API không khả dụng hoặc trả về lỗi
//           if (!response.ok) {
//             // Giả lập thành công nếu API không hoạt động
//             const bookingId = Date.now(); // Giả lập booking_id
//             const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//             Alert.alert(
//               "Thành công",
//               `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//               [
//                 {
//                   text: "OK",
//                   onPress: () => {
//                     Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                     navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//                   },
//                 },
//               ]
//             );
//             return;
//           }

//           const data = await response.json();
//           const bookingId = data.booking_id || Date.now();
//           const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//           Alert.alert(
//             "Thành công",
//             `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//             [
//               {
//                 text: "OK",
//                 onPress: () => {
//                   Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                   navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//                 },
//               },
//             ]
//           );
//         } catch (err) {
//           console.error("Lỗi handleBookTicket (MoMo):", err);
//           // Giả lập thành công nếu có lỗi (để đảm bảo hiển thị mã QR)
//           const bookingId = Date.now();
//           const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//           Alert.alert(
//             "Thành công",
//             `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//             [
//               {
//                 text: "OK",
//                 onPress: () => {
//                   Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                   navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//                 },
//               },
//             ]
//           );
//         }
//       }, 2000); // Giả lập thời gian xử lý thanh toán
//     } else {
//       // Xử lý cho VNPAY và Thẻ tín dụng
//       try {
//         const response = await fetch(
//           `https://mynameisgiao.pythonanywhere.com/events/${eventId}/book/`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
//             },
//             body: JSON.stringify({
//               event_id: eventId,
//               tickets: Object.keys(selectedTickets)
//                 .filter((ticketId) => selectedTickets[ticketId] > 0)
//                 .map((ticketId) => ({
//                   id: parseInt(ticketId),
//                   quantity: selectedTickets[ticketId],
//                 })),
//               user_info: {
//                 email: userInfo.email,
//                 phone: userInfo.phone,
//               },
//               payment_method: paymentMethod,
//             }),
//           }
//         );

//         if (!response.ok) {
//           const bookingId = Date.now();
//           const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//           Alert.alert(
//             "Thành công",
//             `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//             [
//               {
//                 text: "OK",
//                 onPress: () => {
//                   Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                   navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//                 },
//               },
//             ]
//           );
//           return;
//         }

//         const data = await response.json();
//         const bookingId = data.booking_id || Date.now();
//         const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//         Alert.alert(
//           "Thành công",
//           `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                 navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//               },
//             },
//           ]
//         );
//       } catch (err) {
//         console.error("Lỗi handleBookTicket:", err);
//         const bookingId = Date.now();
//         const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
//         Alert.alert(
//           "Thành công",
//           `Đặt vé thành công!\nMã QR: ${qrCode}\nVé sẽ được gửi qua email.`,
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 Alert.alert("Thông báo", "Vé đã được gửi qua email và thông báo push!");
//                 navigation.reset({
//                       index: 0,
//                       routes: [
//                         { name: 'BottomTab', params: { screen: 'Vé của tôi' } }
//                       ],
//                     });
//               },
//             },
//           ]
//         );
//       }
//     }
//   };

//   const insets = useSafeAreaInsets();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar backgroundColor={colors.green} barStyle="light-content" />
//       <View style={{ paddingTop: insets.top, backgroundColor: colors.green }}>
//         <CustomHeader title="Đặt vé" />
//       </View>
//       <View style={styles.stepper}>
//         <Text style={styles.stepText}>Chọn vé</Text>
//         <Text style={styles.stepText}>Thông tin</Text>
//         <Text style={[styles.stepText, styles.stepActive]}>Thanh toán</Text>
//       </View>
//       <View style={styles.timerContainer}>
//         <Text style={styles.timerText}>
//           <Text>Hoàn tất đặt vé trong </Text>
//           <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
//         </Text>
//       </View>
//       <View style={styles.content}>
//         <View style={styles.contentContainer}>
//           <Text style={styles.eventTitle}>Thông tin thanh toán</Text>
//           <View style={styles.ticketSummary}>
//             <Text style={styles.ticketSummaryText}>
//               Tổng số vé: {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)}
//             </Text>
//             <Text style={[styles.ticketSummaryText, { color: colors.green }]}>
//               Tổng tiền: {formatPrice(totalPrice)}
//             </Text>
//           </View>

//           <View style={styles.ticketInfo}>
//             <Text style={styles.ticketInfoTitle}>Thông tin nhận vé</Text>
//             <Text style={styles.ticketInfoText}>
//               Vé điện tử sẽ được hiển thị trong mục "Vé của tôi" của tài khoản
//             </Text>
//           </View>

//           <View style={styles.paymentMethod}>
//             <Text style={styles.paymentMethodTitle}>Phương thức thanh toán</Text>
//             <TouchableOpacity
//               style={styles.paymentOption}
//               onPress={() => setSelectedPayment("MoMo")}
//             >
//               <View style={styles.radioCircle}>
//                 {selectedPayment === "MoMo" && <View style={styles.radioSelected} />}
//               </View>
//               <Text style={styles.paymentOptionText}>MoMo</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.paymentOption}
//               onPress={() => setSelectedPayment("VNPAY")}
//             >
//               <View style={styles.radioCircle}>
//                 {selectedPayment === "VNPAY" && <View style={styles.radioSelected} />}
//               </View>
//               <Text style={styles.paymentOptionText}>VNPAY/Ứng dụng ngân hàng</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.paymentOption}
//               onPress={() => setSelectedPayment("CreditCard")}
//             >
//               <View style={styles.radioCircle}>
//                 {selectedPayment === "CreditCard" && <View style={styles.radioSelected} />}
//               </View>
//               <Text style={styles.paymentOptionText}>Thẻ tín dụng</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       <SafeAreaView edges={["bottom"]} style={styles.footer}>
//         <TouchableOpacity
//           style={[styles.continueButton, !selectedPayment && styles.disabledButton]}
//           onPress={() => selectedPayment && handleBookTicket(selectedPayment)}
//           disabled={!selectedPayment}
//         >
//           <Text style={styles.continueButtonText}>Thanh toán</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.base,
//   },
//   stepper: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     backgroundColor: colors.card,
//     paddingVertical: 10,
//   },
//   stepText: {
//     fontSize: 14,
//     color: colors.white,
//     opacity: 0.5,
//   },
//   stepActive: {
//     opacity: 1,
//     fontWeight: "bold",
//     color: colors.green,
//   },
//   timerContainer: {
//     backgroundColor: colors.card,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     position: "sticky",
//     top: 0,
//     zIndex: 10,
//   },
//   timerText: {
//     fontSize: 18,
//     color: colors.white,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   timerHighlight: {
//     color: colors.green,
//     fontWeight: "bold",
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//   },
//   eventTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: colors.white,
//     marginBottom: 10,
//   },
//   ticketSummary: {
//     backgroundColor: colors.card,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,    
//   },
//   ticketSummaryText: {
//     fontSize: 16,
//     color: colors.white,
//     fontWeight: "bold",
//   },
//   ticketInfo: {
//     backgroundColor: colors.card,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//   },
//   ticketInfoTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: colors.white,
//     marginBottom: 10,
//   },
//   ticketInfoText: {
//     fontSize: 16,
//     color: colors.white,
//   },
//   paymentMethod: {
//     marginTop: 20,
//   },
//   paymentMethodTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: colors.white,
//     marginBottom: 10,
//   },
//   paymentOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.card,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 10,
//   },
//   radioCircle: {
//     height: 20,
//     width: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: colors.white,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },
//   radioSelected: {
//     height: 12,
//     width: 12,
//     borderRadius: 6,
//     backgroundColor: colors.green,
//   },
//   paymentOptionText: {
//     fontSize: 16,
//     color: colors.white,
//     fontWeight: "bold",
//   },
//   footer: {
//     paddingHorizontal: 15,
//     paddingBottom: 60,
//   },
//   continueButton: {
//     alignSelf: "flex-end",
//     backgroundColor: colors.green,
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   continueButtonText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: colors.white,
//   },
//   disabledButton: {
//     backgroundColor: colors.secondary,
//   },
// });

// export default Payment;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking, // Thêm Linking để redirect
  ActivityIndicator, // Thêm ActivityIndicator để hiển thị loading
} from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "react-native";
import CustomHeader from "../CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg"; // Thêm thư viện QRCode

const Payment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, tickets, selectedTickets, totalPrice, timeLeft: initialTimeLeft, userInfo } = route.params;
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 15 * 60); // Tiếp tục từ thời gian còn lại
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Trạng thái hiển thị modal
  const [qrCodeValue, setQrCodeValue] = useState(""); // Giá trị mã QR
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái xử lý thanh toán

  useEffect(() => {
  const handleDeepLink = (event) => {
    const url = event.url;
    if (url.includes("your-app-scheme://payment-callback")) {
      const bookingId = Date.now();
      const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
      setQrCodeValue(qrCode);
      setModalVisible(true);
      setIsProcessing(false);
      // Cập nhật: Thêm navigation với refresh
      navigation.reset({
        index: 0,
        routes: [{ name: "BottomTab", params: { screen: "Vé của tôi", refresh: true } }],
      });
    }
  };

  Linking.addEventListener("url", handleDeepLink);

  Linking.getInitialURL().then((url) => {
    if (url && url.includes("your-app-scheme://payment-callback")) {
      const bookingId = Date.now();
      const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
      setQrCodeValue(qrCode);
      setModalVisible(true);
      setIsProcessing(false);
      // Cập nhật: Thêm navigation với refresh
      navigation.reset({
        index: 0,
        routes: [{ name: "BottomTab", params: { screen: "Vé của tôi", refresh: true } }],
      });
    }
  });

  return () => {
    Linking.removeAllListeners("url");
  };
}, [eventId, navigation]); // Thêm navigation vào dependency

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

  const handleBookTicket = async (paymentMethod) => {
  if (!userInfo || !userInfo.email || !userInfo.phone) {
    Alert.alert("Lỗi", "Thông tin người dùng không đầy đủ. Vui lòng quay lại bước trước.");
    return;
  }

  setIsProcessing(true);

  if (paymentMethod === "MoMo") {
    setTimeout(() => {
      try {
        const momoUrl = "momo://main?redirectUrl=your-redirect-url";
        Linking.canOpenURL(momoUrl).then((supported) => {
          if (supported) {
            Linking.openURL(momoUrl).then(() => {
              setTimeout(() => {
                const bookingId = Date.now();
                const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
                setQrCodeValue(qrCode);
                setModalVisible(true);
                setIsProcessing(false);
              }, 1000);
            });
          } else {
            Alert.alert(
              "Lỗi",
              "Ứng dụng MoMo không được cài đặt. Vui lòng cài đặt MoMo để tiếp tục.",
              [{ text: "OK", onPress: () => setIsProcessing(false) }]
            );
          }
        });
      } catch (err) {
        console.error("Lỗi redirect MoMo:", err);
        Alert.alert("Lỗi", "Không thể mở ứng dụng MoMo. Vui lòng thử lại.", [
          { text: "OK", onPress: () => setIsProcessing(false) },
        ]);
      }
    }, 2000);
  } else {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/${eventId}/book/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
          },
          body: JSON.stringify({
            event_id: eventId,
            tickets: Object.keys(selectedTickets)
              .filter((ticketId) => selectedTickets[ticketId] > 0)
              .map((ticketId) => ({
                id: parseInt(ticketId),
                quantity: selectedTickets[ticketId],
              })),
            user_info: {
              email: userInfo.email,
              phone: userInfo.phone,
            },
            payment_method: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        const bookingId = Date.now();
        const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
        setQrCodeValue(qrCode);
        setModalVisible(true);
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      const bookingId = data.booking_id || Date.now();
      const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
      setQrCodeValue(qrCode);
      setModalVisible(true);
      setIsProcessing(false);
      // Cập nhật: Thêm navigation với refresh
      navigation.reset({
        index: 0,
        routes: [{ name: "BottomTab", params: { screen: "Vé của tôi", refresh: true } }],
      });
    } catch (err) {
      console.error("Lỗi handleBookTicket:", err);
      const bookingId = Date.now();
      const qrCode = `QR-${bookingId}-${eventId}-${Date.now()}`;
      setQrCodeValue(qrCode);
      setModalVisible(true);
      setIsProcessing(false);
    }
  }
};

  const insets = useSafeAreaInsets();

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
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          <Text>Hoàn tất đặt vé trong </Text>
          <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
        </Text>
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

          <View style={styles.ticketInfo}>
            <Text style={styles.ticketInfoTitle}>Thông tin nhận vé</Text>
            <Text style={styles.ticketInfoText}>
              Vé điện tử sẽ được hiển thị trong mục "Vé của tôi" của tài khoản
            </Text>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPayment("MoMo")}
            >
              <View style={styles.radioCircle}>
                {selectedPayment === "MoMo" && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.paymentOptionText}>MoMo</Text>
            </TouchableOpacity>
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
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={styles.processingText}>Đang xử lý thanh toán qua {selectedPayment}...</Text>
          </View>
        )}
      </View>

      {/* Modal hiển thị mã QR */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "BottomTab", params: { screen: "Vé của tôi" } }],
          });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Thanh toán thành công!</Text>
            <Text style={styles.modalSubtitle}>Mã QR của bạn:</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={qrCodeValue}
                size={200}
                color={colors.base}
                backgroundColor={colors.white}
              />
            </View>
            <Text style={styles.modalText}>
              Vé sẽ được gửi qua email và thông báo push!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: "BottomTab", params: { screen: "Vé của tôi" } }],
                });
              }}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  timerHighlight: {
    color: colors.green,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
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
    fontWeight: "bold",
  },
  ticketInfo: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  ticketInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  ticketInfoText: {
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
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 60,
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
  // Style cho modal hiển thị mã QR
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
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.base,
    marginBottom: 15,
  },
  qrCodeContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 14,
    color: colors.base,
    textAlign: "center",
    marginBottom: 20,
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
  // Style cho overlay xử lý
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  processingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default Payment;