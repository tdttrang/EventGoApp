import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  Platform,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../utils/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tách form thành component riêng
const CreateEventForm = React.memo(
  ({
    newEvent,
    setNewEvent,
    handleCreateEvent,
    isEditing,
    showCreateForm,
    setShowCreateForm,
    nameRef,
    descriptionRef,
    timeRef,
    locationRef,
    ticketPriceRef,
    categoryRef,
  }) => {
    const [localEvent, setLocalEvent] = useState({
      id: newEvent.id,
      name: newEvent.name,
      description: newEvent.description,
      time: newEvent.time,
      location: newEvent.location,
      ticketPrice: newEvent.ticketPrice,
      category: newEvent.category || "Music", // Giá trị mặc định
    });

    const handleFocus = (ref) => {
      ref.current?.focus();
    };

    const updateLocalField = (field, value) => {
      setLocalEvent((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const saveAndCreate = () => {
      // Kiểm tra dữ liệu trước khi gửi
      if (!localEvent.name.trim()) {
        Alert.alert("Lỗi", "Tên sự kiện không được để trống.");
        return;
      }
      if (!localEvent.description.trim()) {
        Alert.alert("Lỗi", "Mô tả không được để trống.");
        return;
      }
      if (!localEvent.time.trim()) {
        Alert.alert("Lỗi", "Thời gian không được để trống.");
        return;
      }
      if (!localEvent.location.trim()) {
        Alert.alert("Lỗi", "Địa điểm không được để trống.");
        return;
      }
      if (!localEvent.category.trim()) {
        Alert.alert("Lỗi", "Danh mục không được để trống.");
        return;
      }
      const ticketPrice = parseFloat(localEvent.ticketPrice);
      if (isNaN(ticketPrice) || localEvent.ticketPrice.trim() === "") {
        Alert.alert("Lỗi", "Giá vé phải là một số hợp lệ.");
        return;
      }

      // Cập nhật newEvent và gọi handleCreateEvent
      const updatedEvent = {
        ...localEvent,
        ticketPrice: ticketPrice.toString(),
      };
      setNewEvent(updatedEvent);

      // Log để kiểm tra dữ liệu trước khi gửi
      console.log("Dữ liệu sẽ gửi:", updatedEvent);

      handleCreateEvent(updatedEvent);
    };

    return (
      <Modal
        visible={showCreateForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateForm(false);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { paddingTop: 32, paddingBottom: 16 }]}
          >
            <Text style={styles.modalTitle}>
              {isEditing ? "Chỉnh sửa sự kiện" : "Tạo mới sự kiện"}
            </Text>

            <TextInput
              ref={nameRef}
              style={styles.input}
              value={localEvent.name}
              onChangeText={(text) => updateLocalField("name", text)}
              placeholder="Tên sự kiện"
              placeholderTextColor={colors.secondary}
              returnKeyType="next"
              onSubmitEditing={() => handleFocus(descriptionRef)}
              blurOnSubmit={false}
              autoFocus
            />

            <TextInput
              ref={descriptionRef}
              style={styles.input}
              value={localEvent.description}
              onChangeText={(text) => updateLocalField("description", text)}
              placeholder="Mô tả"
              placeholderTextColor={colors.secondary}
              multiline
              returnKeyType="next"
              onSubmitEditing={() => handleFocus(timeRef)}
              blurOnSubmit={false}
            />

            <TextInput
              ref={timeRef}
              style={styles.input}
              value={localEvent.time}
              onChangeText={(text) => updateLocalField("time", text)}
              placeholder="Thời gian (VD: 2025-06-01 14:00)"
              placeholderTextColor={colors.secondary}
              returnKeyType="next"
              onSubmitEditing={() => handleFocus(locationRef)}
              blurOnSubmit={false}
            />

            <TextInput
              ref={locationRef}
              style={styles.input}
              value={localEvent.location}
              onChangeText={(text) => updateLocalField("location", text)}
              placeholder="Địa điểm"
              placeholderTextColor={colors.secondary}
              returnKeyType="next"
              onSubmitEditing={() => handleFocus(categoryRef)}
              blurOnSubmit={false}
            />

            <TextInput
              ref={categoryRef}
              style={styles.input}
              value={localEvent.category}
              onChangeText={(text) => updateLocalField("category", text)}
              placeholder="Danh mục (VD: Music, Sports)"
              placeholderTextColor={colors.secondary}
              returnKeyType="next"
              onSubmitEditing={() => handleFocus(ticketPriceRef)}
              blurOnSubmit={false}
            />

            <TextInput
              ref={ticketPriceRef}
              style={styles.input}
              value={localEvent.ticketPrice}
              onChangeText={(text) => updateLocalField("ticketPrice", text)}
              placeholder="Giá vé"
              keyboardType="numeric"
              placeholderTextColor={colors.secondary}
              returnKeyType="done"
              onSubmitEditing={saveAndCreate}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={saveAndCreate}
            >
              <Text style={styles.buttonText}>
                {isEditing ? "Cập nhật sự kiện" : "Tạo sự kiện"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.red }]}
              onPress={() => {
                setShowCreateForm(false);
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

const ManageEvents = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [newEvent, setNewEvent] = useState({
    id: null,
    name: "",
    description: "",
    time: "",
    location: "",
    ticketPrice: "",
    category: "Music", // Giá trị mặc định
  });
  const [media, setMedia] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [organizerId, setOrganizerId] = useState(null);

  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const timeRef = useRef(null);
  const locationRef = useRef(null);
  const ticketPriceRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    checkVerification();
    fetchEvents();
  }, []);

  const insets = useSafeAreaInsets();

  const checkVerification = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        return;
      }

      const response = await fetch(
        "https://mynameisgiao.pythonanywhere.com/current-user/profile/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Check verification response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          await AsyncStorage.removeItem("access");
          return;
        }
        throw new Error(
          errorData.detail || "Không thể lấy thông tin người dùng."
        );
      }

      const userData = await response.json();
      console.log("User profile data:", userData);
      if (userData.role === "organizer") {
        setIsVerified(true);
        setOrganizerId(userData.id);
      } else {
        Alert.alert(
          "Lỗi",
          "Bạn cần quyền tổ chức sự kiện để truy cập. Vui lòng liên hệ quản trị viên."
        );
        setIsVerified(false);
      }
    } catch (err) {
      console.error("Lỗi checkVerification:", err);
      Alert.alert(
        "Lỗi",
        "Không thể kiểm tra trạng thái xác thực: " + err.message
      );
      setIsVerified(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access");
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("DATA FETCH EVENTS:", data);
      setAllEvents(data);
      setEvents(data.slice(0, visibleCount));
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    if (!isVerified || !organizerId) {
      Alert.alert("Lỗi", "Bạn chưa được xác thực để tạo sự kiện.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access");
      const endpoint = eventData.id
        ? `https://mynameisgiao.pythonanywhere.com/events/manage/${eventData.id}/update/`
        : `https://mynameisgiao.pythonanywhere.com/events/manage/create/`;
      const method = eventData.id ? "PUT" : "POST";

      // Log dữ liệu gửi lên để kiểm tra
      console.log("Dữ liệu gửi lên API:", {
        name: eventData.name,
        description: eventData.description,
        time: eventData.time,
        location: eventData.location,
        ticket_price: parseFloat(eventData.ticketPrice),
        category: eventData.category,
        organizer: organizerId,
      });

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: eventData.name,
          description: eventData.description,
          time: eventData.time,
          location: eventData.location,
          ticket_price: parseFloat(eventData.ticketPrice),
          category: eventData.category,
          organizer: organizerId,
        }),
      });

      console.log("Event response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response data:", errorData);
        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          await AsyncStorage.removeItem("access");
          return;
        }
        throw new Error(
          errorData.detail ||
            Object.values(errorData)
              .map((errors) => errors.join(", "))
              .join(" ") ||
            "Không thể tạo/cập nhật sự kiện."
        );
      }

      const data = await response.json();
      console.log("Event created/updated:", data);
      if (eventData.id) {
        setEvents(
          events.map((event) => (event.id === eventData.id ? data : event))
        );
        setAllEvents(
          allEvents.map((event) => (event.id === eventData.id ? data : event))
        );
      } else {
        setEvents([data, ...events]);
        setAllEvents([data, ...allEvents]);
      }
      setNewEvent({
        id: null,
        name: "",
        description: "",
        time: "",
        location: "",
        ticketPrice: "",
        category: "Music",
      });
      setIsEditing(false);
      setShowCreateForm(false);
      Alert.alert(
        "Thành công",
        eventData.id
          ? "Cập nhật sự kiện thành công!"
          : "Tạo sự kiện thành công!"
      );
    } catch (err) {
      console.error("Lỗi handleCreateEvent:", err);
      Alert.alert(
        "Lỗi",
        `${eventData.id ? "Cập nhật" : "Tạo"} sự kiện thất bại: ${err.message}`
      );
    }
  };

  const pickMedia = async (eventId) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện để tải media.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia(result.assets[0].uri);
        await uploadMedia(eventId, result.assets[0].uri);
      } else {
        console.log("Media selection canceled:", result);
        Alert.alert("Lỗi", "Không thể chọn media.");
      }
    } catch (err) {
      console.error("Lỗi pickMedia:", err);
      Alert.alert("Lỗi", "Không thể chọn media.");
    }
  };

  const uploadMedia = async (eventId, mediaUri) => {
    try {
      const token = await AsyncStorage.getItem("access");
      const formData = new FormData();
      formData.append("file", {
        uri: mediaUri,
        type:
          mediaUri.endsWith(".jpg") || mediaUri.endsWith(".jpeg")
            ? "image/jpeg"
            : "video/mp4",
        name: `media_${Date.now()}${mediaUri.split(".").pop()}`,
      });

      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/${eventId}/upload/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("Upload media response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          await AsyncStorage.removeItem("access");
          return;
        }
        throw new Error(errorData.detail || "Tải media thất bại.");
      }

      Alert.alert("Thành công", "Tải media thành công!");
    } catch (err) {
      console.error("Lỗi uploadMedia:", err);
      Alert.alert("Lỗi", `Tải media thất bại: ${err.message}`);
    }
  };

  const renderEventItem = useCallback(
    ({ item }) => (
      <View style={styles.eventItem}>
        {item.media_url ? (
          <Image
            source={{ uri: item.media_url }}
            style={styles.eventImage}
            onError={() => console.log("Lỗi tải ảnh:", item.media_url)}
          />
        ) : (
          <Text style={styles.eventDetail}>Không có ảnh</Text>
        )}
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventDetail}>{item.description}</Text>
        <Text style={styles.eventDetail}>{item.date}</Text>
        <Text style={styles.eventDetail}>{item.location}</Text>
        <Text style={styles.eventDetail}>
          Giá vé: {item.min_price?.toLocaleString() || "N/A"} VNĐ -{" "}
          {item.max_price?.toLocaleString() || "N/A"} VNĐ
        </Text>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => pickMedia(item.id)}
        >
          <Text style={styles.buttonText}>Tải ảnh/video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditEvent(item)}
        >
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEvent(item.id)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    ),
    [pickMedia, handleEditEvent, handleDeleteEvent]
  );

  const handleEditEvent = useCallback((event) => {
    setNewEvent({
      id: event.id,
      name: event.name,
      description: event.description,
      time: event.time || "",
      location: event.location || "",
      ticketPrice: event.ticket_price || "",
      category: event.category || "Music",
    });
    setIsEditing(true);
    setShowCreateForm(true);
  }, []);

  const handleDeleteEvent = useCallback(async (eventId) => {
    try {
      const token = await AsyncStorage.getItem("access");
      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/manage/${eventId}/delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete event response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          await AsyncStorage.removeItem("access");
          return;
        }
        throw new Error(errorData.detail || "Xóa sự kiện thất bại.");
      }

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      setAllEvents((prevAllEvents) =>
        prevAllEvents.filter((event) => event.id !== eventId)
      );
      Alert.alert("Thành công", "Xóa sự kiện thành công!");
    } catch (err) {
      console.error("Lỗi handleDeleteEvent:", err);
      Alert.alert("Lỗi", "Xóa sự kiện thất bại: " + err.message);
    }
  }, []);

  const handleLoadMore = () => {
    if (events.length < allEvents.length) {
      const newCount = Math.min(events.length + 3, allEvents.length);
      setEvents(allEvents.slice(0, newCount));
    }
  };

  const renderHeader = () => (
    <>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 60 + insets.top },
        ]}
      >
        <Text style={styles.logo}>Quản lý Sự kiện</Text>
      </View>
      <View style={styles.form}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setShowCreateForm(true);
            setIsEditing(false);
            setNewEvent({
              id: null,
              name: "",
              description: "",
              time: "",
              location: "",
              ticketPrice: "",
              category: "Music",
            });
            Keyboard.dismiss();
          }}
        >
          <Text style={styles.buttonText}>Tạo mới sự kiện</Text>
        </TouchableOpacity>
      </View>
      <CreateEventForm
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        handleCreateEvent={handleCreateEvent}
        isEditing={isEditing}
        showCreateForm={showCreateForm}
        setShowCreateForm={setShowCreateForm}
        nameRef={nameRef}
        descriptionRef={descriptionRef}
        timeRef={timeRef}
        locationRef={locationRef}
        ticketPriceRef={ticketPriceRef}
        categoryRef={categoryRef}
      />
    </>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Chưa có sự kiện nào.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.green} />
          ) : null
        }
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

// Giữ nguyên styles không thay đổi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: colors.green,
    position: "relative",
  },
  logo: {
    fontSize: 22,
    color: colors.white,
  },
  content: {
    paddingBottom: 20,
  },
  form: {
    padding: 20,
    backgroundColor: colors.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.base,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: colors.white,
  },
  createButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  eventItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginHorizontal: 10,
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  eventDetail: {
    fontSize: 14,
    color: colors.white,
    marginTop: 5,
  },
  mediaButton: {
    backgroundColor: colors.green,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: colors.blue,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: colors.red,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
  },
});

export default ManageEvents;
