import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { colors } from "../../utils/colors";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/MyContexts";

const Profile = () => {
  const navigation = useNavigation();
  const { setLoggedInUser } = React.useContext(MyUserContext);

  const handleLogout = async () => {
    try {
      // Xóa token từ AsyncStorage
      await AsyncStorage.removeItem("access");
      // Đặt loggedInUser về null để AppNavigator tự chuyển về Welcome
      setLoggedInUser(null);
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đây là màn hình Tài khoản</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2526",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;