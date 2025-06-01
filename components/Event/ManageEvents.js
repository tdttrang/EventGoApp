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
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // Cần cài: expo install @react-native-picker/picker
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
    dateRef,
    timeRef,
    locationRef,
    categoryRef,
  }) => {
    const [localEvent, setLocalEvent] = useState({
      id: newEvent.id,
      name: newEvent.name,
      description: newEvent.description,
      date: newEvent.date || "",
      time: newEvent.time || "",
      location: newEvent.location,
      tickets: newEvent.tickets || [
        { ticket_class: "normal", price: "", quantity: "" },
      ], // Mảng vé động
      category: newEvent.category || "Music",
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

    const updateTicketField = (index, field, value) => {
      setLocalEvent((prev) => {
        const newTickets = [...prev.tickets];
        newTickets[index] = { ...newTickets[index], [field]: value };
        return { ...prev, tickets: newTickets };
      });
    };

    const addTicket = () => {
      setLocalEvent((prev) => ({
        ...prev,
        tickets: [
          ...prev.tickets,
          { ticket_class: "normal", price: "", quantity: "" },
        ],
      }));
    };

    const removeTicket = (index) => {
      setLocalEvent((prev) => {
        const newTickets = prev.tickets.filter((_, i) => i !== index);
        return { ...prev, tickets: newTickets };
      });
    };

    const saveAndCreate = () => {
      // Validate dữ liệu
      if (!localEvent.name.trim()) {
        Alert.alert("Lỗi", "Tên sự kiện không được để trống.");
        return;
      }
      if (!localEvent.description.trim()) {
        Alert.alert("Lỗi", "Mô tả không được để trống.");
        return;
      }
      if (!localEvent.date.trim()) {
        Alert.alert("Lỗi", "Ngày không được để trống.");
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

      const tickets = localEvent.tickets
        .map((ticket) => {
          const price = parseFloat(ticket.price);
          const quantity = parseInt(ticket.quantity);
          if (!["normal", "VIP"].includes(ticket.ticket_class)) {
            Alert.alert("Lỗi", "Loại vé phải là 'normal' hoặc 'VIP'.");
            return null;
          }
          if (isNaN(price) || price <= 0) {
            Alert.alert("Lỗi", "Giá vé phải là số thực dương.");
            return null;
          }
          if (isNaN(quantity) || quantity <= 0) {
            Alert.alert("Lỗi", "Số lượng vé phải là số nguyên dương.");
            return null;
          }
          return { ticket_class: ticket.ticket_class, price, quantity };
        })
        .filter((ticket) => ticket !== null);

      if (tickets.length === 0) {
        Alert.alert("Lỗi", "Ít nhất cần một loại vé.");
        return;
      }

      // Kiểm tra định dạng ngày (YYYY-MM-DD)
      if (!localEvent.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        Alert.alert(
          "Lỗi",
          "Ngày phải có định dạng YYYY-MM-DD (VD: 2025-09-14)."
        );
        return;
      }

      // Kiểm tra định dạng thời gian (HH:mm)
      if (!localEvent.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        Alert.alert("Lỗi", "Thời gian phải có định dạng HH:mm (VD: 19:00).");
        return;
      }

      const updatedEvent = {
        ...localEvent,
        date: localEvent.date,
        time: localEvent.time,
        tickets,
      };
      setNewEvent(updatedEvent);

      console.log("Dữ liệu sẽ gửi:", updatedEvent);

      handleCreateEvent(updatedEvent);
    };

    // Dropdown options cho ticket_class
    const ticketOptions = [
      { label: "Vé thường", value: "normal" },
      { label: "Vé VIP", value: "VIP" },
    ];

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { paddingTop: 32, paddingBottom: 16 },
              ]}
            >
              <Text style={styles.modalTitle}>
                {isEditing ? "Chỉnh sửa sự kiện" : "Tạo mới sự kiện"}
              </Text>

              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
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
                  onSubmitEditing={() => handleFocus(dateRef)}
                  blurOnSubmit={false}
                />

                <TextInput
                  ref={dateRef}
                  style={styles.input}
                  value={localEvent.date}
                  onChangeText={(text) => updateLocalField("date", text)}
                  placeholder="Ngày (VD: 2025-09-14)"
                  placeholderTextColor={colors.secondary}
                  returnKeyType="next"
                  onSubmitEditing={() => handleFocus(timeRef)}
                  blurOnSubmit={false}
                />

                <TextInput
                  ref={timeRef}
                  style={styles.input}
                  value={localEvent.time}
                  onChangeText={(text) => updateLocalField("time", text)}
                  placeholder="Thời gian (VD: 19:00)"
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
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  blurOnSubmit={false}
                />

                <Text style={styles.sectionTitle}>Danh sách vé</Text>
                {localEvent.tickets.map((ticket, index) => (
                  <View key={index} style={styles.ticketContainer}>
                    <Picker
                      selectedValue={ticket.ticket_class}
                      style={styles.input}
                      onValueChange={(value) =>
                        updateTicketField(index, "ticket_class", value)
                      }
                    >
                      {ticketOptions.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                    <TextInput
                      style={styles.input}
                      value={ticket.price}
                      onChangeText={(text) =>
                        updateTicketField(index, "price", text)
                      }
                      placeholder="Giá vé (VNĐ)"
                      keyboardType="numeric"
                      placeholderTextColor={colors.secondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={ticket.quantity}
                      onChangeText={(text) =>
                        updateTicketField(index, "quantity", text)
                      }
                      placeholder="Số lượng"
                      keyboardType="numeric"
                      placeholderTextColor={colors.secondary}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTicket(index)}
                    >
                      <Text style={styles.buttonText}>Xóa vé</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addButton} onPress={addTicket}>
                  <Text style={styles.buttonText}>Thêm vé</Text>
                </TouchableOpacity>

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
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    date: "",
    time: "",
    location: "",
    tickets: [{ ticket_class: "normal", price: "", quantity: "" }],
    category: "Music",
  });
  const [media, setMedia] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [organizerId, setOrganizerId] = useState(null);

  const nameRef = useRef(null);
  const descriptionRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const locationRef = useRef(null);
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

      const requestData = {
        name: eventData.name.trim(),
        description: eventData.description.trim(),
        date: eventData.date.trim(),
        time: eventData.time.trim(),
        location: eventData.location.trim(),
        tickets: eventData.tickets,
        category: eventData.category.trim(),
        organizer: organizerId,
      };
      console.log("Dữ liệu gửi lên API:", JSON.stringify(requestData, null, 2));

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("Event response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("JSON Parse error:", jsonError);
          if (response.status === 500) {
            console.log(
              "Dữ liệu có thể đã được lưu, tự động làm mới danh sách..."
            );
            Alert.alert(
              "Cảnh báo",
              "Có lỗi từ server (status 500), nhưng sự kiện có thể đã được tạo. Đang làm mới danh sách..."
            );
            await fetchEvents();
            setNewEvent({
              id: null,
              name: "",
              description: "",
              date: "",
              time: "",
              location: "",
              tickets: [{ ticket_class: "normal", price: "", quantity: "" }],
              category: "Music",
            });
            setIsEditing(false);
            setShowCreateForm(false);
            return;
          }
          throw new Error(
            "Server trả về dữ liệu không hợp lệ: " +
              responseText.substring(0, 100)
          );
        }
      } else {
        throw new Error("Server không trả về dữ liệu.");
      }

      if (!response.ok) {
        console.log("Error response data:", data);
        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          await AsyncStorage.removeItem("access");
          return;
        }
        let errorMessage = "Không thể tạo/cập nhật sự kiện.";
        if (response.status === 500) {
          errorMessage =
            "Server gặp lỗi (status 500). Đang làm mới danh sách...";
          Alert.alert(
            "Cảnh báo",
            "Có lỗi từ server, nhưng sự kiện có thể đã được tạo. Đang làm mới danh sách..."
          );
          await fetchEvents();
          setNewEvent({
            id: null,
            name: "",
            description: "",
            date: "",
            time: "",
            location: "",
            tickets: [{ ticket_class: "normal", price: "", quantity: "" }],
            category: "Music",
          });
          setIsEditing(false);
          setShowCreateForm(false);
          return;
        }
        if (Array.isArray(data)) {
          errorMessage = data.join(", ");
        } else if (typeof data === "string") {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        if (errorMessage === "Sự kiện đã tồn tại.") {
          errorMessage =
            "Sự kiện với tên, ngày và địa điểm này đã tồn tại. Vui lòng thay đổi thông tin.";
        }
        throw new Error(errorMessage);
      }

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
        date: "",
        time: "",
        location: "",
        tickets: [{ ticket_class: "normal", price: "", quantity: "" }],
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

      let fileType;
      if (mediaUri.endsWith(".jpg") || mediaUri.endsWith(".jpeg")) {
        fileType = "image/jpeg";
      } else if (mediaUri.endsWith(".png")) {
        fileType = "image/png";
      } else if (mediaUri.endsWith(".mp4")) {
        fileType = "video/mp4";
      } else if (mediaUri.endsWith(".mpeg")) {
        fileType = "video/mpeg";
      } else {
        throw new Error(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ jpg, png, mp4, mpeg."
        );
      }

      formData.append("file", {
        uri: mediaUri,
        type: fileType,
        name: `media_${Date.now()}${mediaUri.split(".").pop()}`,
      });

      console.log("Dữ liệu formData gửi lên:", formData);

      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/${eventId}/upload/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("Upload media response status:", response.status);
      const responseText = await response.text();
      console.log("Raw upload response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("JSON Parse error:", jsonError);
          throw new Error(
            "Server trả về dữ liệu không hợp lệ: " +
              responseText.substring(0, 200)
          );
        }

        if (response.status === 401) {
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
            [
              {
                text: "OK",
                onPress: async () => await AsyncStorage.removeItem("access"),
              },
            ]
          );
          return;
        }

        const errorMessage = errorData.error || "Tải media thất bại.";
        const errorDetails = errorData.details
          ? `\nChi tiết: ${errorData.details}`
          : "";
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const data = JSON.parse(responseText);
      console.log("Upload media data:", data);
      Alert.alert(
        "Thành công",
        "Tải media thành công! URL: " +
          (data.media_urls ? data.media_urls[0] : ""),
        [{ text: "OK" }]
      );
    } catch (err) {
      console.error("Lỗi uploadMedia:", err);
      Alert.alert(
        "Lỗi tải media",
        `Không thể tải media lên do lỗi server: ${err.message}\nBạn có muốn thử lại?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Thử lại", onPress: () => uploadMedia(eventId, mediaUri) }, // Gọi lại hàm uploadMedia
        ]
      );
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
        <Text style={styles.eventDetail}>
          {item.date
            ? (() => {
                const [date, time] = item.date.split("T");
                // Lấy giờ và phút từ time (bỏ giây và Z)
                const hourMinute = time ? time.substring(0, 5) : "";
                return `${date} - ${hourMinute}`;
              })()
            : "N/A"}
        </Text>
        {/* Hiển thị ngày và giờ từ date ISO */}
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
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      tickets: event.tickets.map((t) => ({
        ticket_class: t.ticket_class || "normal",
        price: t.price?.toString() || "",
        quantity: t.quantity?.toString() || "",
      })) || [{ ticket_class: "normal", price: "", quantity: "" }],
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
              date: "",
              time: "",
              location: "",
              tickets: [{ ticket_class: "normal", price: "", quantity: "" }],
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
        dateRef={dateRef}
        timeRef={timeRef}
        locationRef={locationRef}
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

// Styles
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 15,
    marginBottom: 10,
  },
  ticketContainer: {
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: colors.red,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  ticketsList: {
    marginTop: 10,
  },
});

export default ManageEvents;
