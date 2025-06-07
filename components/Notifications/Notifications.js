import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MyUserContext } from "../../configs/MyContexts";
import { authApi, endpoints } from "../../configs/Apis";
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/colors";

// Kích hoạt LayoutAnimation cho Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Notifications = () => {
  const { loggedInUser } = useContext(MyUserContext);
  const token = loggedInUser?.token;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // Fetch thông báo từ server
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await authApi(token).get(endpoints["list-notifications"]);
      console.log("Thông báo trả về:", res.data);
      const sorted = res.data.results.sort((a, b) => a.is_read - b.is_read);
      setNotifications(sorted);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mỗi item sẽ tự giữ animation opacity + translateY riêng
  const NotificationItem = ({ item, onPress }) => {
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    const handlePress = () => {
      // Chỉ chạy animation và đánh dấu đã đọc nếu thông báo chưa đọc
      if (!item.is_read) {
        opacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
        translateY.value = withTiming(20, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
        setTimeout(() => {
          onPress(item.id);
          opacity.value = withTiming(1, { duration: 0 }); // Reset animation
          translateY.value = withTiming(0, { duration: 0 });
        }, 350);
      }
    };

    return (
      <Animated.View style={[styles.notificationItem, animatedStyle]}>
        <TouchableOpacity
          style={[item.is_read ? styles.read : styles.unread]}
          activeOpacity={0.7}
          onPress={handlePress}
        >
          <View style={styles.row}>
            <Icon
              name={item.is_read ? "bell-outline" : "bell-ring"}
              size={24}
              color={item.is_read ? colors.gray : colors.green}
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>
                {moment(item.created_at).fromNow()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Cập nhật trạng thái đã đọc trong state, sắp xếp lại
  const markAsRead = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotifications((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      );
      updated.sort((a, b) => a.is_read - b.is_read);
      return updated;
    });
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, is_read: true }));
      updated.sort((a, b) => a.is_read - b.is_read);
      return updated;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 60 + insets.top },
        ]}
      >
        <Text style={styles.headerTitle}>Thông báo</Text>
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
            <Icon
              name="check-all"
              size={20}
              color={
                notifications.some((item) => !item.is_read)
                  ? colors.green
                  : colors.gray
              }
            />
            <Text
              style={[
                styles.markAllText,
                {
                  color: notifications.some((item) => !item.is_read)
                    ? colors.green
                    : colors.gray,
                },
              ]}
            >
              Đã đọc
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={markAsRead} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có thông báo nào.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    backgroundColor: colors.green,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.white,
    fontFamily: "Bold",
    textAlign: "center",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: "SemiBold",
    marginLeft: 5,
  },
  content: { padding: 20 },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 15,
    overflow: "hidden",
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
  unread: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    padding: 15,
  },
  read: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray,
    padding: 15,
  },
  subject: {
    fontSize: 16,
    fontFamily: "SemiBold",
    color: colors.white,
  },
  message: {
    fontSize: 14,
    marginTop: 4,
    color: colors.secondary,
    fontFamily: "Regular",
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    color: colors.secondary,
    fontFamily: "Regular",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  empty: {
    textAlign: "center",
    color: colors.secondary,
    marginTop: 20,
    fontSize: 16,
    fontFamily: "Regular",
  },
});
