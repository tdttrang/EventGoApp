import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";

const AdminEventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "view", "create", "edit"
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    price: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        return;
      }

      const res = await fetch(
        "https://mynameisgiao.pythonanywhere.com/api/events/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        Alert.alert("Lỗi", "Không thể tải danh sách sự kiện.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEvents(data.results || data);
    } catch (error) {
      Alert.alert("Lỗi", "Lỗi kết nối hoặc dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xem chi tiết
  const openViewModal = (event) => {
    setSelectedEvent(event);
    setModalType("view");
    setModalVisible(true);
  };

  // Mở modal tạo mới
  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
      price: "",
    });
    setSelectedEvent(null);
    setModalType("create");
    setModalVisible(true);
  };

  // Mở modal sửa
  const openEditModal = (event) => {
    setFormData({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      price: event.price?.toString() || "",
    });
    setSelectedEvent(event);
    setModalType("edit");
    setModalVisible(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Gửi tạo event
  const handleCreateEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      const res = await fetch(
        "https://mynameisgiao.pythonanywhere.com/api/events/manage/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            start_time: formData.start_time,
            end_time: formData.end_time,
            price: parseFloat(formData.price),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        Alert.alert("Lỗi tạo sự kiện", JSON.stringify(errData));
        return;
      }

      Alert.alert("Thành công", "Sự kiện đã được tạo.");
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo sự kiện.");
    }
  };

  // Gửi sửa event
  const handleEditEvent = async () => {
    if (!selectedEvent) return;

    try {
      const token = await AsyncStorage.getItem("access");
      const res = await fetch(
        `https://mynameisgiao.pythonanywhere.com/api/events/manage/${selectedEvent.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            start_time: formData.start_time,
            end_time: formData.end_time,
            price: parseFloat(formData.price),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        Alert.alert("Lỗi cập nhật sự kiện", JSON.stringify(errData));
        return;
      }

      Alert.alert("Thành công", "Sự kiện đã được cập nhật.");
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật sự kiện.");
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {item.start_time?.substring(0, 10)} -{" "}
          {item.end_time?.substring(0, 10)}
        </Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text style={styles.eventPrice}>
          Giá vé: {item.price?.toLocaleString()} VND
        </Text>
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnView]}
          onPress={() => openViewModal(item)}
        >
          <Text style={styles.btnText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.btnText}>Sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Modal nội dung tùy theo modalType
  const renderModalContent = () => {
    if (modalType === "view" && selectedEvent) {
      return (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
          <Text style={styles.modalLabel}>Mô tả:</Text>
          <Text style={styles.modalText}>{selectedEvent.description}</Text>
          <Text style={styles.modalLabel}>Địa điểm:</Text>
          <Text style={styles.modalText}>{selectedEvent.location}</Text>
          <Text style={styles.modalLabel}>Thời gian:</Text>
          <Text style={styles.modalText}>
            {selectedEvent.start_time} - {selectedEvent.end_time}
          </Text>
          <Text style={styles.modalLabel}>Giá vé:</Text>
          <Text style={styles.modalText}>
            {selectedEvent.price?.toLocaleString()} VND
          </Text>

          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Modal form tạo / sửa
    if (modalType === "create" || modalType === "edit") {
      return (
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {modalType === "create" ? "Tạo sự kiện mới" : "Chỉnh sửa sự kiện"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Tên sự kiện"
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả"
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Địa điểm"
            value={formData.location}
            onChangeText={(text) => handleChange("location", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Thời gian bắt đầu (YYYY-MM-DDTHH:mm:ss)"
            value={formData.start_time}
            onChangeText={(text) => handleChange("start_time", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Thời gian kết thúc (YYYY-MM-DDTHH:mm:ss)"
            value={formData.end_time}
            onChangeText={(text) => handleChange("end_time", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá vé (VND)"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => handleChange("price", text)}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.green }]}
              onPress={
                modalType === "create" ? handleCreateEvent : handleEditEvent
              }
            >
              <Text style={styles.modalBtnText}>
                {modalType === "create" ? "Tạo" : "Lưu"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#888" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Quản lý sự kiện</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Text style={styles.addBtnText}>+ Thêm sự kiện</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEventItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>{renderModalContent()}</View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminEventManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtnText: {
    color: colors.white,
    fontWeight: "600",
  },
  eventCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    marginBottom: 12,
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: "#555",
  },
  eventLocation: {
    fontSize: 13,
    color: "#777",
  },
  eventPrice: {
    fontSize: 13,
    color: colors.green,
    marginTop: 4,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnView: {
    backgroundColor: colors.blue,
    marginRight: 6,
  },
  btnEdit: {
    backgroundColor: colors.orange,
  },
  btnText: {
    color: colors.white,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },

  modalContent: {
    // flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "600",
    marginTop: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCloseBtnText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  modalBtnText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
});
