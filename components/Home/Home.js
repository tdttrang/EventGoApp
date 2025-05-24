// import React, { useEffect, useState, useContext, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   Dimensions
// } from "react-native";
// import { Video } from 'expo-video';
// import { useNavigation } from "@react-navigation/native";
// import { MyUserContext } from "../../configs/MyContexts";
// import { authApi, endpoints } from "../../configs/Apis";
// import { colors } from "../../utils/colors";
// import { fonts } from "../../utils/fonts";

// const screenWidth = Dimensions.get("window").width;

// const Home = () => {
//   const navigation = useNavigation();
//   const { loggedInUser } = useContext(MyUserContext);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const api = authApi(loggedInUser?.access);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await api.get(endpoints.events);
//         setEvents(res.data);
//       } catch (err) {
//         console.error("Failed to fetch events", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const renderEventItem = ({ item }) => (
//     <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}>
//       <Image source={{ uri: item.banner }} style={styles.eventImage} />
//       <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
//       <Text style={styles.eventTime}>{item.start_time}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       {/* Banner */}
//       <Video
//         source={{ uri: "https://cdn.popsww.com/blog/sites/2/2022/03/ticketbox-la-gi-1.jpg" }}
//         rate={1.0}
//         volume={1.0}
//         isMuted={true}
//         resizeMode="cover"
//         shouldPlay
//         isLooping
//         style={styles.video}
//       />

//       {/* Loading */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
//       ) : (
//         <>
//           {/* Trending */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Sự kiện nổi bật</Text>
//             <FlatList
//               data={events.slice(0, 5)}
//               horizontal
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderEventItem}
//               showsHorizontalScrollIndicator={false}
//             />
//           </View>

//           {/* Recommended */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Đề xuất cho bạn</Text>
//             <FlatList
//               data={events.slice(5, 10)}
//               horizontal
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderEventItem}
//               showsHorizontalScrollIndicator={false}
//             />
//           </View>

//           {/* Genres (e.g., Music, Workshop...) */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Thể loại</Text>
//             <FlatList
//               data={events.slice(10, 15)}
//               horizontal
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderEventItem}
//               showsHorizontalScrollIndicator={false}
//             />
//           </View>
//         </>
//       )}
//     </ScrollView>
//   );
// };

// export default Home;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   video: {
//     width: screenWidth,
//     height: 200,
//   },
//   section: {
//     marginTop: 20,
//     paddingHorizontal: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: colors.primary,
//     marginBottom: 10,
//   },
//   eventCard: {
//     width: 180,
//     marginRight: 15,
//   },
//   eventImage: {
//     width: "100%",
//     height: 100,
//     borderRadius: 10,
//   },
//   eventTitle: {
//     fontSize: 16,
//     fontWeight: "500",
//     marginTop: 5,
//     color: colors.secondary,
//   },
//   eventTime: {
//     fontSize: 12,
//     color: colors.gray,
//     marginTop: 2,
//   },
// });
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
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


// Sửa: Thay thế videoUri bằng URL hoạt động (URL mẫu từ W3Schools để kiểm tra)
const videoUri = "https://res.cloudinary.com/ddmyxqinz/video/upload/v1748062139/18557099-hd_1280_720_30fps_rlertj.mp4";

// Sửa: Thêm URL ảnh hoạt động, đảm bảo tất cả đều truy cập được
const bannerItems = [
  videoUri,
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300", // Ảnh từ Unsplash để thay thế
  "https://images.unsplash.com/photo-1519125323398-675f398f6978?w=300", // Ảnh từ Unsplash để thay thế
];


const eventImages = [
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058223/07_5_hv8jbd.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058227/07_3_dajomn.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058226/07_4_qfwiwl.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058248/02_ext2no.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058244/05_d8zolm.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058249/01_g3ywr0.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058251/07_1_yp9i6a.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058254/03_knunrn.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058255/06_nfow3c.jpg",
  "https://res.cloudinary.com/ddmyxqinz/image/upload/v1748058241/04_wbyjud.jpg",
];

const Home = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef(null); 
  const [muted, setMuted] = useState(true);
  const toggleMute = () => {
    setMuted(!muted);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mynameisgiao.pythonanywhere.com/events/");
      const data = await response.json();
      if (response.ok) {
        // map lại dữ liệu, gán media_url mặc định nếu chưa có
        const dataWithMedia = data.map((event, idx) => {
          // Ví dụ: event nào có is_video true thì gán videoUri, ngược lại gán ảnh theo index vòng tròn
          if (event.is_video) {
            return { ...event, media_url: videoUri };
          }
          // Gán ảnh theo index mod độ dài array ảnh
          const imgIndex = idx % eventImages.length;
          return { ...event, media_url: event.media_url || eventImages[imgIndex] };
        });
        setEvents(dataWithMedia);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tải sự kiện");
      }
    } catch (err) {
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


  const renderBanner = ({ item }) => {
  if (item.endsWith(".mp4")) {
    return (
      <View style={styles.bannerItems}>
        <Video
          source={{ uri: item }}
          style={styles.video}
          resizeMode="cover"
          isMuted={muted}
          shouldPlay
          isLooping
          onError={(e) => console.log("Video error:", e)}
          onLoad={() => console.log("Video loaded:", item)}
        />
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Hiển thị ảnh
  return (
    <Image
      source={{ uri: item }}
      style={styles.bannerImage}
      defaultSource={{ uri: "https://via.placeholder.com/300x200" }}
      onError={(e) => console.log("Image error:", e.nativeEvent.error)}
      onLoad={() => console.log("Image loaded:", item)}
    />
  );
};


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
        {/* Sửa: Chỉ hiển thị tên sự kiện, giá, và ngày */}
        <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.eventPrice}>Từ {formatPrice(item.min_price)}</Text>
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  // const renderEvent = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.eventCard}
  //     onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
  //   >
  //     {item.media_url?.endsWith('.mp4') ? (
  //       <Video
  //         source={{ uri: item.media_url }}
  //         style={styles.eventImage}
  //         useNativeControls
  //         resizeMode="contain"
  //         isMuted={true}
  //         shouldPlay={false}
  //       />
  //     ) : (
  //       <Image
  //         source={{ uri: item.media_url || "https://via.placeholder.com/150" }}
  //         style={styles.eventImage}
  //       />
  //     )}

  //     <View style={styles.eventInfo}>
  //       <Text style={styles.eventTitle}>{item.name}</Text>
  //       <Text style={styles.eventCategory}>{item.category}</Text>
  //       <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
  //       <Text style={styles.eventLocation}>{item.location}</Text>
  //       <Text style={styles.eventPrice}>Từ {formatPrice(item.min_price)}</Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  const Section = ({ title, data, emoji }) => (
    <View style={styles.sectionContainer}>
      <View style = {styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.green}
        translucent={true}
      />
      <View style={styles.header}>
        <Text style={styles.logo}>EventGo</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.ScrollViewContent}>
        {/* Thêm: Carousel hỗ trợ cả video và ảnh */}
        <FlatList
          data={bannerItems}
          renderItem={renderBanner}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}          
        />

      {/* <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: "https://res.cloudinary.com/ddmyxqinz/video/upload/v1748062139/18557099-hd_1280_720_30fps_rlertj.mp4" }}
          style={styles.video}
          muted={videoMuted}
          isLooping
          shouldPlay={true}
          resizeMode="contain"
          useNativeControls 
          isMuted={videoMuted}
          onError={(e) => console.log("Video error:", e)}

        />
        <TouchableOpacity
          style={styles.muteButton}
          onPress={async () => {
            const newMuted = !videoMuted;
            setVideoMuted(newMuted);
            if (videoRef.current) {
              await videoRef.current.setIsMutedAsync(newMuted); 
            }
          }}
        >
          <Ionicons
            name={videoMuted ? "volume-mute" : "volume-high"}
            size={18}
            color="white"
          />
        </TouchableOpacity>
      </View> */}

      {loading ? (
        <ActivityIndicator size="large" color={colors.green} />
      ) : (
        <>
            <Section
              title="Sự kiện xu hướng"
              emoji="🔥"
              data={events.slice(0, 5)}
            />
            <Section
              title="Dành cho bạn"
              emoji="🎯"
              data={events.slice(5, 10)}
            />
            <Section
              title="Thể loại: Âm nhạc"
              emoji="🎵"
              data={events.filter(e => e.category === "Âm nhạc")}
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
    marginRight: 10,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  bannerImage: {
    width: width,
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
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
    fontSize: 22,
    marginRight: 8,
    marginLeft: 20,
  },
  eventCard: {
    backgroundColor: colors.card,
    marginHorizontal: 10,
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
});
