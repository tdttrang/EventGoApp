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
      console.log("Profile data:", data);
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
    console.log("Permission status:", status);
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
      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("ImagePicker result:", result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
        uploadAvatar(result.assets[0].uri);
      } else {
        console.log("Image selection canceled or no assets returned:", result);
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

      const response = await fetch("https://mynameisgiao.pythonanywhere.com/current-user/profile/avatar/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Upload error:", errorData);
        Alert.alert("Lỗi", `${errorData.error || "Không thể tải ảnh lên."} Chi tiết: ${errorData.details || "Kết nối bị từ chối."}`);
        return;
      }

      const data = await response.json();
      setAvatar(data.avatar_url);
      setUser(prev => ({ ...prev, avatar: data.avatar_url }));

      Alert.alert("Thành công", "Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error("Lỗi uploadAvatar:", err);
      Alert.alert("Lỗi", `Không thể tải ảnh lên. Chi tiết: ${err.message}`);
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
        {/* Profile Info Card */}
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
            !editing // Show arrow only if not editing
          )}
          {editing && (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tên người dùng"
                placeholderTextColor={colors.secondary} // Dùng secondary cho placeholder
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

          {renderSectionItem(
            "key-outline",
            "Thiết lập mã PIN",
            () => Alert.alert("Chức năng chưa có", "Chức năng thiết lập mã PIN đang được phát triển."),
            true
          )}
        </View>

        {/* App Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cài đặt ứng dụng</Text>
          {renderSectionItem(            
            "language-outline",
            "Thay đổi ngôn ngữ",
            () => Alert.alert("Chức năng chưa có", "Chức năng thay đổi ngôn ngữ đang được phát triển."),
            true,
            <View style={styles.languageIndicator}>
              <Text style={styles.languageText}>Vie</Text>
              <Ionicons name="star" size={16} color={colors.green} /> 
            </View>
          )}
        </View>

        {/* Help Center Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trung tâm trợ giúp</Text>
          {renderSectionItem(
            "help-circle-outline",
            "Trung tâm trợ giúp",
            () => Linking.openURL("https://your-help-center-link.com"), // Thay thế bằng link trung tâm trợ giúp của bạn
            true
          )}
        </View>

        {/* Logout Button (as a separate card-like item) */}
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
  container: {
    flex: 1,
    backgroundColor: colors.base, // Sử dụng màu 'base' làm nền chính
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: colors.green,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.white,
    fontFamily: fonts.Bold,  
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  profileInfoCard: {
    backgroundColor: colors.card, // Sử dụng màu 'card' làm nền cho thẻ profile
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary, // Dùng màu primary cho shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.green,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.green,
    borderRadius: 20,
    padding: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  username: {
    fontSize: 26,
    color: colors.white, // Username màu trắng
    marginTop: 10,
    fontFamily: fonts.Bold,
  },
  email: {
    fontSize: 16,
    color: colors.secondary, // Email màu secondary
    marginTop: 5,
    fontFamily: fonts.Regular,
  },
  role: {
    fontSize: 16,
    color: colors.secondary, // Role màu secondary
    marginTop: 5,
    fontFamily: fonts.Regular,
  },
  card: {
    backgroundColor: colors.card, // Nền thẻ dùng màu 'card'
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary, // Dùng màu primary cho shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    color: colors.white, // Tiêu đề thẻ màu white
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray, // Viền dưới dùng màu gray
    marginBottom: 10,
    fontFamily: fonts.SemiBold, // Dùng font Poppins-SemiBold
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    // Loại bỏ borderBottom cho mục cuối cùng trong mỗi card nếu cần
  },
  sectionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionItemText: {
    fontSize: 16,
    color: colors.white, // Text mục màu primary
    marginLeft: 15,
    fontFamily: fonts.Regular,
  },
  editForm: {
    paddingVertical: 10,
  },
  input: {
    height: 45,
    backgroundColor: colors.base, // Input nền màu base
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: colors.white, // Text input màu trắng
    fontFamily: fonts.Regular,
    borderWidth: 1,
    borderColor: colors.gray, // Viền input màu gray
  },
  saveButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.secondary, // Nút hủy dùng màu secondary
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: 16,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray, // Nền tag ngôn ngữ dùng màu gray
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageText: {
    color: colors.primary, // Text tag ngôn ngữ màu primary
    fontSize: 14,
    marginRight: 4,
    fontFamily: fonts.Regular,
  },  
});

export default Profile;