import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import moment from "moment";
import { Video } from "expo-av";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const videoUri = "https://res.cloudinary.com/ddmyxqinz/video/upload/v1748062139/18557099-hd_1280_720_30fps_rlertj.mp4";

const bannerItems = [
  { media_url: videoUri, title: "Sự kiện nổi bật #1", event_id: 1 },
  { media_url: "https://static.vecteezy.com/system/resources/thumbnails/028/346/723/small_2x/concert-party-disco-crowd-at-concert-generative-ai-photo.jpeg", title: "Sự kiện #1", event_id: 2 },
  { media_url: "https://wallpaperaccess.com/full/1381397.jpg", title: "Sự kiện #2", event_id: 3 },
];

const Home = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const flatListRef = useRef(null);

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  // auto scroll banner
  useEffect(() => {
  if (bannerItems.length === 0) return;
  const interval = setInterval(() => {
    const nextIndex = (currentBannerIndex + 1) % bannerItems.length;
    setCurrentBannerIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, 5000); // Chuyển banner mỗi 5 giây
  return () => clearInterval(interval);
}, [currentBannerIndex]);



  useEffect(() => {
    fetchEvents();
  }, []);

  const sortEventsByDateDesc = (eventsArray) => {
  return [...eventsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getEventsByCategory = (categoryName) =>
  events.filter((e) => e.category?.toLowerCase() === categoryName.toLowerCase());


  const fetchEvents = async () => {
  setLoading(true);
  try {
    const response = await fetch("https://mynameisgiao.pythonanywhere.com/events/");
    const data = await response.json();
    if (response.ok) {
      setEvents(data); 
    } else {
      Alert.alert("Lỗi", data.message || "Không thể tải sự kiện");
    }
  } catch (err) {
      console.log("Lỗi fetchEvents:", err); // thêm dòng này để biết lỗi thật
    Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải sự kiện.");
  } finally {
    setLoading(false);
  }
};

  


  const formatDate = (date) => moment(date).format("DD/MM/YYYY HH:mm");
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderBanner = ({ item, index }) => {
  const isVideo = item.media_url.endsWith(".mp4");
  return (
    <TouchableOpacity
      style={styles.bannerItems}
      onPress={() =>
        navigation.navigate("EventDetails", { eventId: item.event_id })
      }
    >
      {isVideo ? (
        <>
          <Video
            source={{ uri: item.media_url }}
            style={styles.video}
            resizeMode="cover"
            isMuted={muted}
            shouldPlay={currentBannerIndex === index}
            isLooping
            onError={(e) => console.log("Video error:", e)}
          />
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            <Ionicons
              name={muted ? "volume-mute" : "volume-high"}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </>
      ) : (
        <Image
          source={{ uri: item.media_url }}
          style={styles.bannerImage}
          onError={(e) => console.log("Image error:", e.nativeEvent.error)}
        />
      )}
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const renderBannerDots = () => (
  <View style={styles.bannerDots}>
    {bannerItems.map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          {
            backgroundColor:
              currentBannerIndex === index ? colors.green : colors.gray,
          },
        ]}
      />
    ))}
  </View>
);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
    >
      <Image
        source={{ uri: item.media_url || "https://via.placeholder.com/150" }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.eventPrice}>Từ {formatPrice(item.min_price)}</Text>
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const Section = ({ title, data, emoji, onSeeAll }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>Xem thêm &gt;&gt;</Text>
      </TouchableOpacity>
    </View>
    <FlatList
      data={data}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    />
  </View>
);


  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} translucent={true} />
      <View style={styles.header}>
        <Text style={styles.logo}>EventGo</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.ScrollViewContent}>
        <View>
          <FlatList
            ref={flatListRef}
            data={bannerItems}
            renderItem={renderBanner}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            snapToInterval={width}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentBannerIndex(index);
            }}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          {renderBannerDots()}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.green} />
        ) : (
          <>
            <Section
              title="Sự kiện xu hướng"
              data={sortEventsByDateDesc(events).slice(0, 5)} // Lấy 5 sự kiện mới nhất
              emoji="🔥"
              onSeeAll={() => navigation.navigate("Category", { category: "Sự kiện xu hướng" })}
            />

            <Section
              title="Gợi ý cho bạn"
              data={filteredEvents} // Có thể giữ nguyên hoặc lọc riêng nếu có logic gợi ý
              emoji="✨"
              onSeeAll={() => navigation.navigate("Category", { category: "Hòa nhạc" })}
            />

            <Section
              title="Thể loại âm nhạc"
              data={getEventsByCategory("Âm nhạc")}
              emoji="🎵"
              onSeeAll={() => navigation.navigate("Category", { category: "Âm nhạc" })}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;



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
    height: 60,
    backgroundColor: "#00C73E",
    position: "absolute", // Cố định header
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  ScrollViewContent: {
    paddingTop: 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    color: colors.primary,
  },
  videoContainer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    height: "100%",  
  },
  bannerItems:{
    width: width, 
    height: 200,
    marginRight: 0,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  bannerImage: {
    width: width,
    height: 200,
    borderRadius: 8,
  },
  bannerOverlay: {
  position: "absolute",
  bottom: 15,
  left: 15,
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: 8,
  borderRadius: 4,
},
bannerTitle: {
  color: colors.white,
  fontSize: 16,
  fontWeight: "600",
},
bannerDots: {
  flexDirection: "row",
  justifyContent: "center",
  position: "absolute",
  bottom: 6,
  width: "100%",
},
dot: {
  width: 7,
  height: 7,
  borderRadius: 5,
  marginHorizontal: 4,
},
  muteButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    
  },
  sectionHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: 5,
    marginLeft: 18,
  },
  eventCard: {
    backgroundColor: colors.card,
    marginHorizontal: 5,
    width: 180,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  eventImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  eventInfo: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 5,
  },
  eventCategory: {
    color: colors.secondary,
    fontSize: 14,
    marginVertical: 2,
  },
  eventDate: {
    color: colors.white,
    fontSize: 13,
  },
  eventLocation: {
    color: colors.secondary,
    fontSize: 13,
  },
  eventPrice: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 3,
  },
  seeAllText: {
  fontSize: 14,
  color: colors.secondary,
  marginRight: 10,
  },
});
