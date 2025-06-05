import React, { useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";


const AdminDashboard = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets(); 
  const { setLoggedInUser } = useContext(MyUserContext); 


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
        console.error("API error (raw):", errorText); // Log nội dung HTML trả về
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách user.\n" + errorText.substring(0, 200)
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Users fetched:", data);
      setUsers(data.results);
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
        const errorText = await response.text(); // 👈 thêm dòng này thay vì .json()
        console.error("Approve error raw:", errorText);
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

  const handleEditUser = (userId) => {
    navigation.navigate("EditUser", { userId });
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

  const handleLogout = async () => {
  await AsyncStorage.removeItem("access");
  await AsyncStorage.removeItem("refresh");
  setLoggedInUser(null); // Cập nhật context, AppNavigator sẽ tự chuyển stack
};

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate("UserDetails", { userId: item.id })}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>
          Vai trò: {item.role} {item.is_approved ? "(Đã duyệt)" : "(Chưa duyệt)"}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} translucent={true} />
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Text style={styles.logo}>EventGo</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingTop: 56 + insets.top, flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} style={styles.loading} />
        ) : (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách người dùng</Text>
            </View>
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.userList}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: colors.green,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  userList: {
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: colors.card,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: colors.white,
    marginTop: 2,
  },
  userRole: {
    fontSize: 14,
    color: colors.white,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  approveButton: {
    backgroundColor: colors.green,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: "#FF6347", // Đỏ cam để nổi bật
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
});

export default AdminDashboard;