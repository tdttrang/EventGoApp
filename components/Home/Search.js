import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../utils/colors";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "react-native";

const Search = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setEvents([]);
    setPage(1);
    setHasMore(true);
    const delayDebounce = setTimeout(() => {
      fetchEvents(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, category, location, dateFilter, sortBy]);

  const fetchEvents = async (pageNum) => {
    if (!hasMore && pageNum !== 1) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append("search", searchQuery.trim().toLowerCase());
      }
      if (category) queryParams.append("category", category.toLowerCase());
      if (location) queryParams.append("location", location.toLowerCase());
      if (dateFilter !== "all") queryParams.append("date", dateFilter);
      if (sortBy) queryParams.append("sort", sortBy);
      queryParams.append("page", pageNum);

      const response = await fetch(
        `https://mynameisgiao.pythonanywhere.com/events/?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("access")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        const filteredEvents = filterEvents(data.results || data);
        setEvents((prev) => (pageNum === 1 ? filteredEvents : [...prev, ...filteredEvents]));
        setHasMore(!!data.next);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải sự kiện");
      }
    } catch (err) {
      console.error("Lỗi fetchEvents:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (data) => {
    return data
      .filter((event) => {
        const lowerQuery = searchQuery.trim().toLowerCase();
        const matchesSearch = !searchQuery || 
          event.name.toLowerCase().includes(lowerQuery) ||
          event.description.toLowerCase().includes(lowerQuery) ||
          event.category.toLowerCase().includes(lowerQuery) ||
          event.location.toLowerCase().includes(lowerQuery);
        const matchesCategory = !category || event.category.toLowerCase().includes(category.toLowerCase());
        const matchesLocation = !location || event.location.toLowerCase().includes(location.toLowerCase());
        const matchesDate = dateFilter === "all" || checkDateFilter(event.date, dateFilter);
        return matchesSearch && matchesCategory && matchesLocation && matchesDate;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_desc":
            return new Date(b.date) - new Date(a.date);
          case "date_asc":
            return new Date(a.date) - new Date(b.date);
          default:
            return 0;
        }
      });
  };

  const checkDateFilter = (eventDate, filter) => {
    const now = moment();
    const eventMoment = moment(eventDate);
    switch (filter) {
      case "today":
        return eventMoment.isSame(now, "day");
      case "week":
        return eventMoment.isBetween(now, now.clone().add(7, "days"));
      case "month":
        return eventMoment.isBetween(now, now.clone().add(1, "month"));
      default:
        return true;
    }
  };

  const loadMoreEvents = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchEvents(nextPage);
        return nextPage;
      });
    }
  }, [loading, hasMore]);

  const formatDate = (date) => moment(date).format("DD/MM/YYYY HH:mm");
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
    >
      <Image
        source={{ uri: item.media_url || "https://via.placeholder.com/150" }}
        style={styles.eventImage}
        resizeMode="cover"
        onLoad={() => {}} // Placeholder cho lazy load
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text style={styles.eventPrice}>Từ {formatPrice(item.min_price)}</Text>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => navigation.navigate("BookTicket", { eventId: item.id })}
        >
          <Text style={styles.buyButtonText}>Mua vé</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập từ khóa"
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity onPress={() => fetchEvents(1)}>
            <Ionicons name="search" size={24} color={colors.green} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setDateFilter(dateFilter === "all" ? "today" : "all")}
          >
            <Text style={styles.filterButtonText}>
              {dateFilter === "all" ? "Tất cả các ngày" : dateFilter === "today" ? "Hôm nay" : dateFilter}
              <Ionicons name="chevron-down" size={16} color={colors.white} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              Bộ lọc <Ionicons name="filter" size={16} color={colors.white} />
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <ScrollView>
                <Text style={styles.modalSection}>Vị trí</Text>
                {["Toàn Quốc", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Huế", "Nha Trang", "Đà Lạt"].map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.modalOption}
                    onPress={() => {
                      setLocation(loc === "Toàn Quốc" ? "" : loc);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        location === (loc === "Toàn Quốc" ? "" : loc)
                          ? styles.selectedOption
                          : styles.unselectedOption,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.modalSection}>Thể loại</Text>
                {["Âm nhạc", "DJ Party", "Biểu diễn nghệ thuật", "Hòa nhạc"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.modalOption}
                    onPress={() => {
                      setCategory(cat);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        category === cat ? styles.selectedCategory : styles.unselectedCategory,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.modalSection}>Sắp xếp</Text>
                {["date_desc", "date_asc"].map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={styles.modalOption}
                    onPress={() => {
                      setSortBy(sort);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {sort === "date_desc" ? "Mới nhất" : "Cũ nhất"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalReset}
                  onPress={() => {
                    setCategory("");
                    setLocation("");
                    setSortBy("date_desc");
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalResetText}>Thiết lập lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalApply}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalApplyText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {loading && page === 1 ? (
          <ActivityIndicator size="large" color={colors.green} style={styles.loading} />
        ) : (
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultsContainer}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 140,
              offset: 140 * index,
              index,
            })}
            onEndReached={loadMoreEvents}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không tìm thấy sự kiện nào.</Text>
            }
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator size="small" color={colors.green} />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.base,
    paddingHorizontal: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: colors.primary,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  filterButtonText: {
    color: colors.white,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.base,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 15,
  },
  modalSection: {
    fontSize: 16,
    color: colors.white,
    marginTop: 15,
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.white,
  },
  selectedOption: {
    color: "#00CED1", // Cyan đậm cho vị trí được chọn
  },
  unselectedOption: {
    color: "#40E0D0", // Cyan nhạt cho vị trí không được chọn
  },
  selectedCategory: {
    color: "#32CD32", // Xanh lá đậm cho thể loại được chọn
  },
  unselectedCategory: {
    color: "#90EE90", // Xanh lá nhạt cho thể loại không được chọn
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalReset: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 10,
  },
  modalResetText: {
    color: colors.white,
    fontSize: 16,
  },
  modalApply: {
    flex: 1,
    backgroundColor: colors.green,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  modalApplyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  eventImage: {
    width: 100,
    height: 140,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  eventInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 5,
  },
  eventPrice: {
    fontSize: 14,
    color: colors.green,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buyButton: {
    backgroundColor: colors.green,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  buyButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  resultsContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyText: {
    color: colors.white,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  loading: {
    marginTop: 20,
  },
});

export default Search;