import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, endpoints } from "../../configs/Apis";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const AdminEventManager = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [data, setData] = useState([]);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTicketModalVisible, setEditTicketModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editTicketClass, setEditTicketClass] = useState("");
  const [editTicketPrice, setEditTicketPrice] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");


  useEffect(() => {
    fetchData();
  }, [selectedSection]);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        console.error("No access token found");
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        return;
      }
      const api = authApi(token);

      let endpoint = "";
      switch (selectedSection) {
        case "users":
          endpoint = endpoints["admin_users"];
          break;
        case "events":
          endpoint = endpoints["events"];
          break;
        case "tickets":
          endpoint = endpoints["admin_tickets"];
          break;
        case "notifications":
          endpoint = endpoints["admin_notifications"];
          break;
        default:
          setData([]);
          return;
      }

      const res = await api.get(endpoint);
      setData(res.data.results || res.data); // Xử lý cả trường hợp có hoặc không có 'results'
      if (selectedSection === "tickets") {
        console.log("Ticket data:", res.data.results || res.data);
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy dữ liệu:",
        error.response?.status,
        error.response?.data || error.message
      );
      Alert.alert(
        "Lỗi",
        `Không thể tải dữ liệu. Mã lỗi: ${
          error.response?.status || "Không xác định"
        }`
      );
      setData([]);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setEditTicketClass(ticket.ticket_class);
    setEditTicketPrice(ticket.price.toString());
    setEditEventDate(ticket.event?.date || "");
    setEditEventLocation(ticket.event?.location || "");
    setEditTicketModalVisible(true);
  };

  const handleSaveEditTicket = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/api/admin/tickets/${editingTicket.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticket_class: editTicketClass,
            price: editTicketPrice,
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        console.log("Lỗi cập nhật vé:", err);
        Alert.alert(
          "Lỗi",
          err.error || JSON.stringify(err) || "Không thể cập nhật vé."
        );
        return;
      }
      Alert.alert("Thành công", "Đã cập nhật thông tin vé!");
      setEditTicketModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật vé.");
    }
  };

  const handleEditUser = (userId) => {
    const user = data.find((u) => u.id === userId); // Sửa lại dòng này
    setEditingUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa user này? Hành động không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access");
              const response = await fetch(
                `https://mynameisgiao.pythonanywhere.com/api/admin/users/${userId}/`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Lỗi", errorData.error || "Không thể xóa user.");
                return;
              }

              Alert.alert("Thành công", "User đã bị xóa.");
              fetchData();
            } catch (err) {
              console.error("Lỗi deleteUser:", err);
              Alert.alert("Lỗi", "Không thể xóa user. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };  

  const handleSaveEdit = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/api/admin/users/${editingUser.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editUsername,
            email: editEmail,
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        console.log("Lỗi cập nhật user:", err); // Thêm dòng này để xem lỗi chi tiết
        Alert.alert(
          "Lỗi",
          err.error || JSON.stringify(err) || "Không thể cập nhật user."
        );
        return;
      }
      Alert.alert("Thành công", "Đã cập nhật thông tin user!");
      setEditModalVisible(false);
      setData((prevData) =>
        prevData.map((u) =>
          u.id === editingUser.id
            ? { ...u, username: editUsername, email: editEmail }
            : u
        )
      );
      fetchData();
      } catch (err) {
      console.log("Lỗi ngoại lệ:", err); // Thêm dòng này để xem lỗi ngoại lệ
      Alert.alert("Lỗi", "Không thể cập nhật user.");
    }
  };


  const renderItem = ({ item }) => {
    if (selectedSection === "tickets") {
      console.log("Ticket item:", item);
    }
    let displayText = "";
    switch (selectedSection) {
      case "users":
        displayText = `User ID: ${item.id} - ${
          item.username || item.email || "No Name"
        }`;
        break;
      case "events":
        displayText = `Event ID: ${item.id} - ${item.name || "No Name"}`;
        break;
      case "tickets":
        return (
          <View style={styles.itemBox}>
            <Text style={styles.ticketTitle}>
              {item.event?.name || "Không rõ sự kiện"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 4,
                alignItems: "center",
              }}
            >
              <Text style={styles.ticketLabel}>Loại vé: </Text>
              <Text style={styles.ticketValue}>{item.ticket_class}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 2,
                alignItems: "center",
              }}
            >
              <Text style={styles.ticketLabel}>Giá: </Text>
              <Text style={styles.ticketValue}>
                {Number(item.price).toLocaleString()}đ
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 2,
                alignItems: "center",
              }}
            >
              <Text style={styles.ticketLabel}>Ngày: </Text>
              <Text style={styles.ticketValue}>
                {item.event?.date
                  ? new Date(item.event.date).toLocaleDateString()
                  : "Không rõ"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 2,
                alignItems: "center",
              }}
            >
              <Text style={styles.ticketLabel}>Địa điểm: </Text>
              <Text style={styles.ticketValue}>
                {item.event?.location || "Không rõ"}
              </Text>
            </View>
          </View>
        );
      case "notifications":
        return (
          <View
            style={[
              styles.itemBox,
              {
                borderLeftWidth: 5,
                borderLeftColor: colors.green, // luôn dùng màu xanh
                backgroundColor: colors.card, // luôn dùng màu card
              },
            ]}
          >
            <Text
              style={{ color: colors.green, fontSize: 16, fontFamily: "Bold" }}
            >
              {item.subject || item.title || "Thông báo"}
            </Text>
            <Text style={{ color: colors.white, marginTop: 4 }}>
              {item.message || item.content || item.body || ""}
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.secondary, fontSize: 13 }}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : ""}
              </Text>
            </View>
          </View>
        );
      default:
        displayText = "Item không xác định";
    }
    return (
      <View style={styles.itemBox}>
        <Text style={styles.itemText}>{displayText}</Text>
        {selectedSection === "users" && item.role !== "admin" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditUser(item.id)}
            >
              <Text style={styles.buttonText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}
            >
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>Quản lý Admin</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scrollContent}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              selectedSection === "users" && styles.buttonActive,
            ]}
            onPress={() => setSelectedSection("users")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSection === "users" && styles.buttonTextActive,
              ]}
            >
              User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              selectedSection === "events" && styles.buttonActive,
            ]}
            onPress={() => setSelectedSection("events")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSection === "events" && styles.buttonTextActive,
              ]}
            >
              Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              selectedSection === "tickets" && styles.buttonActive,
            ]}
            onPress={() => setSelectedSection("tickets")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSection === "tickets" && styles.buttonTextActive,
              ]}
            >
              Ticket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              selectedSection === "notifications" && styles.buttonActive,
            ]}
            onPress={() => setSelectedSection("notifications")}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSection === "notifications" && styles.buttonTextActive,
              ]}
            >
              Notification
            </Text>
          </TouchableOpacity>
        </View>
        {selectedSection && (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.noData}>Không có dữ liệu</Text>
            }
          />
        )}
      </View>
      {selectedSection === "users" && (
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 10,
                width: "85%",
              }}
            >
              <Text
                style={{ color: colors.white, fontSize: 18, marginBottom: 10 }}
              >
                Chỉnh sửa User
              </Text>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Tên đăng nhập"
                placeholderTextColor={colors.secondary}
              />
              <TextInput
                style={[styles.input, { marginBottom: 20 }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                placeholderTextColor={colors.secondary}
              />
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <TouchableOpacity
                  style={[styles.editButton, { marginRight: 10 }]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {selectedSection === "tickets" && (
        <Modal
          visible={editTicketModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditTicketModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 10,
                width: "85%",
              }}
            >
              <Text
                style={{ color: colors.white, fontSize: 18, marginBottom: 10 }}
              >
                Chỉnh sửa Vé
              </Text>
              <Text style={styles.ticketLabel}>Loại vé</Text>
              <View
                style={{
                  backgroundColor: colors.base,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Picker
                  selectedValue={editTicketClass}
                  onValueChange={setEditTicketClass}
                  style={{ color: colors.white }}
                  dropdownIconColor={colors.secondary}
                >
                  <Picker.Item label="Normal" value="normal" />
                  <Picker.Item label="VIP" value="VIP" />
                </Picker>
              </View>
              <Text style={styles.ticketLabel}>Giá vé</Text>
              <TextInput
                style={[styles.input, { marginBottom: 20 }]}
                value={editTicketPrice}
                onChangeText={setEditTicketPrice}
                placeholder="Giá vé"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />              
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <TouchableOpacity
                  style={[styles.editButton, { marginRight: 10 }]}
                  onPress={handleSaveEditTicket}
                >
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setEditTicketModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 10,
    width: (Dimensions.get("window").width - 60) / 2,
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
  buttonActive: {
    backgroundColor: colors.green,
  },
  buttonTextActive: {
    color: "#fff",
  },
  buttonText: {
    color: colors.green,
    fontSize: 15,
    fontFamily: "SemiBold",
    textAlign: "center",
  },
  list: {
    marginTop: 10,
    paddingBottom: 20,
  },
  itemBox: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
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
  itemText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Regular",
  },
  noData: {
    color: colors.secondary,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "SemiBold",
    marginVertical: 8,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: colors.base,
    color: colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  actionButton: {
    backgroundColor: colors.green,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: "#007bff",
    paddingVertical: 6, // giảm từ 10 xuống 6
    paddingHorizontal: 14, // giảm từ 20 xuống 14
    borderRadius: 8,
    marginRight: 8, // giảm margin
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  cancelButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SemiBold",
    textAlign: "center",
  },
  ticketTitle: {
    color: colors.green,
    fontSize: 17,
    fontFamily: "Bold",
    marginBottom: 2,
  },
  ticketLabel: {
    color: colors.secondary,
    fontSize: 15,
    fontFamily: "SemiBold",
  },
  ticketValue: {
    color: colors.white,
    fontSize: 15,
    fontFamily: "Regular",
  },
});

export default AdminEventManager;
