import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MyUserContext } from "../../configs/MyContexts";
import { authApi, endpoints } from "../../configs/Apis";
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Notifications = () => {
  const { loggedInUser } = useContext(MyUserContext);
  const token = loggedInUser?.token;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách thông báo từ server
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await authApi(token).get(endpoints.notifications);
        setNotifications(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchNotifications();
  }, [token]);

  // Đánh dấu là đã đọc
  const markAsRead = async (id) => {
    try {
      await authApi(token).post(`${endpoints.notifications}${id}/mark-read/`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.is_read ? styles.read : styles.unread,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.row}>
        <Icon
          name={item.is_read ? "bell-outline" : "bell-ring"}
          size={24}
          color={item.is_read ? "#999" : "#00B14F"}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{moment(item.created_at).fromNow()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B14F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có thông báo nào.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  unread: {
    backgroundColor: "#E9F8F1",
    borderColor: "#00B14F",
  },
  read: {
    backgroundColor: "#F5F5F5",
    borderColor: "#ccc",
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  message: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    color: "#999",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
});
