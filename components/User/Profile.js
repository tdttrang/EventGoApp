import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MyUserContext } from "../../configs/MyContexts";
import axios from "axios"; // Import axios

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const { loggedInUser, setLoggedInUser } = React.useContext(MyUserContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const insets = useSafeAreaInsets();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        navigation.navigate("Login");
        return;
      }

      const response = await fetch("https://mynameisgiao.pythonanywhere.com/current-user/profile/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          await AsyncStorage.removeItem("access");
          navigation.navigate("Login");
        } else {
          const errorData = await response.json();
          Alert.alert("Lỗi", errorData.detail || "Không thể tải thông tin profile.");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUser(data);
      setUsername(data.username);
      setAvatar(data.avatar || "https://via.placeholder.com/150");
      setLoading(false);
    } catch (err) {
      console.error("Lỗi fetchProfile:", err);
      Alert.alert("Lỗi", "Không thể tải thông tin profile. Vui lòng kiểm tra kết nối.");
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập bị từ chối",
        "Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện. Vui lòng cấp quyền trong cài đặt.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    if (Platform.OS === "ios") {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Quyền truy cập camera bị từ chối",
          "Ứng dụng cần quyền truy cập camera để chụp ảnh. Vui lòng cấp quyền trong cài đặt.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    }

    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
        uploadAvatar(result.assets[0].uri);
      } else {
        Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi pickImage:", err);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const uploadAvatar = async (imageUri) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access");
      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: `avatar_${Date.now()}.jpg`,
      });

      const response = await axios.put(
        "https://mynameisgiao.pythonanywhere.com/current-user/profile/avatar/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setAvatar(response.data.avatar_url);
        setUser((prev) => ({ ...prev, avatar: response.data.avatar_url }));
        Alert.alert("Thành công", "Cập nhật ảnh đại diện thành công!");
      } else {
        Alert.alert("Lỗi", "Không thể tải ảnh lên.");
      }
    } catch (err) {
      console.error("Lỗi uploadAvatar:", err);
      Alert.alert("Lỗi", "Không thể tải ảnh lên. Chi tiết: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access");
      const data = {};
      if (username !== user.username) data.username = username;
      if (newPassword) data.new_password = newPassword;
      if (oldPassword) data.old_password = oldPassword;

      const response = await fetch("https://mynameisgiao.pythonanywhere.com/current-user/profile/update/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Lỗi", errorData.errors ? Object.values(errorData.errors)[0] : "Cập nhật thất bại.");
        return;
      }

      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Lỗi handleUpdateProfile:", err);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("access");
          await AsyncStorage.removeItem("refresh");
          setLoggedInUser(null);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.green} />
        <ActivityIndicator size="large" color={colors.green} style={styles.loading} />
      </SafeAreaView>
    );
  }

  const renderSectionItem = (iconName, text, onPress, showArrow = true, customContent = null) => (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.sectionItemLeft}>
        <Ionicons name={iconName} size={24} color={colors.white} />
        <Text style={styles.sectionItemText}>{text}</Text>
      </View>
      {customContent ? (
        customContent
      ) : (
        showArrow && <Ionicons name="chevron-forward-outline" size={24} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileInfoCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
            />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>Vai trò: {user.role}</Text>
        </View>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cài đặt tài khoản</Text>
          {renderSectionItem(
            "person-outline",
            "Thông tin tài khoản",
            () => setEditing(true),
            !editing
          )}
          {editing && (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tên người dùng"
                placeholderTextColor={colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Mật khẩu cũ"
                placeholderTextColor={colors.secondary}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mật khẩu mới"
                placeholderTextColor={colors.secondary}
                secureTextEntry
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.card}>
          {renderSectionItem(
            "log-out-outline",
            "Đăng xuất",
            handleLogout,
            true
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Add all styles from your original code here...
});

export default Profile;
