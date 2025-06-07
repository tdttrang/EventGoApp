import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MyUserContext } from "../../configs/MyContexts";

const AdminUserManager = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(
        "https://mynameisgiao.pythonanywhere.com/api/admin/users/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error (users):", errorText);
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách user.\n" + errorText.substring(0, 200)
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Users fetched:", data);
      setUsers(data.results || []);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi fetchUsers:", err);
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách user. Vui lòng kiểm tra kết nối."
      );
      setLoading(false);
    }
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
      fetchUsers();
    } catch (err) {
      console.log("Lỗi ngoại lệ:", err); // Thêm dòng này để xem lỗi ngoại lệ
      Alert.alert("Lỗi", "Không thể cập nhật user.");
    }
  };

  const handleApproveOrganizer = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("access");
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/api/admin/users/${userId}/approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Approve error:", errorText);
        Alert.alert(
          "Lỗi",
          "Không thể duyệt nhà tổ chức.\n" + errorText.substring(0, 200)
        );
        return;
      }

      const data = await response.json();
      Alert.alert("Thành công", data.message);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi approveOrganizer:", err);
      Alert.alert("Lỗi", "Không thể duyệt nhà tổ chức. Vui lòng thử lại.");
    }
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
              fetchUsers();
            } catch (err) {
              console.error("Lỗi deleteUser:", err);
              Alert.alert("Lỗi", "Không thể xóa user. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };


  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>
          Vai trò: {item.role}
          {item.role !== "admin" &&
            (item.is_approved ? " (Đã duyệt)" : " (Chưa duyệt)")}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {!item.is_approved && item.role === "organizer" && (
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApproveOrganizer(item.id)}
          >
            <Text style={styles.buttonText}>Duyệt</Text>
          </TouchableOpacity>
        )}
        {item.role !== "admin" && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.green}
        translucent={true}
      />
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 56 + insets.top },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duyệt organizer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.green}
            style={styles.loading}
          />
        ) : (
          <FlatList
            data={users.filter((u) => u.role === "organizer")}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Không có organizer nào cần duyệt.
              </Text>
            }
          />
        )}
      </View>
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
              Chỉnh sửa Organizer
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
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: colors.green,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  content: { flex: 1, padding: 15 },
  userCard: {
    backgroundColor: colors.card,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  buttonContainer: { flexDirection: "row", alignItems: "center" },
  approveButton: {
    backgroundColor: colors.green,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  loading: { flex: 1, justifyContent: "center" },
  empty: {
    textAlign: "center",
    color: colors.secondary,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  list: { paddingBottom: 20 },
  input: {
    backgroundColor: colors.base,
    color: colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
});

export default AdminUserManager;
