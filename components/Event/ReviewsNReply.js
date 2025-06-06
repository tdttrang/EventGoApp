import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { authApi, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/MyContexts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StarRating = ({ rating, setRating, maxStars = 5, size = 30 }) => {
  return (
    <View style={styles.starRatingContainer}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <TouchableOpacity key={index} onPress={() => setRating(starValue)}>
            <Ionicons
              name={starValue <= rating ? "star" : "star-outline"}
              size={size}
              color={starValue <= rating ? colors.green : colors.secondary}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Reviews = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const { loggedInUser } = useContext(MyUserContext);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [newReplyComment, setNewReplyComment] = useState("");

  useEffect(() => {
    if (!eventId || isNaN(eventId)) {
      Alert.alert("Lỗi", "Sự kiện không hợp lệ. Vui lòng thử lại.");
      navigation.goBack();
      return;
    }
    fetchEventReviews();
  }, [eventId]);

  const fetchEventReviews = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }
      const api = authApi(token);
      const res = await api.get(endpoints["event-review-list"](eventId));
      console.log("DEBUG - Dữ liệu thô từ API (event-review-list):", res.data);

      let reviewsData = res.data;
      if (
        reviewsData &&
        typeof reviewsData === "object" &&
        "results" in reviewsData
      ) {
        reviewsData = reviewsData.results;
      } else if (!Array.isArray(reviewsData)) {
        console.warn("Dữ liệu không phải mảng:", reviewsData);
        reviewsData = [];
      }

      const transformedReviews = await Promise.all(
        reviewsData.map(async (review) => {
          let replies = [];
          try {
            const replyRes = await api.get(
              endpoints["review-reply-list"](review.id)
            );
            replies = replyRes.data;
            if (
              replies &&
              typeof replies === "object" &&
              "results" in replies
            ) {
              replies = replies.results; // Xử lý phân trang cho phản hồi
            }
          } catch (err) {
            console.warn(
              `Không thể lấy phản hồi cho review ID ${review.id}:`,
              err.message
            );
          }

          return {
            id: review.id,
            content: review.comment,
            rate: review.rating,
            created_date: review.created_at,
            user_info: {
              id: review.user,
              username: `Người dùng ${review.user}`,
              avatar: null,
            },
            replies: Array.isArray(replies) ? replies : [],
          };
        })
      );

      setReviews(transformedReviews);
      console.log("✅ Đánh giá có phản hồi:", transformedReviews);
    } catch (error) {
      console.error(
        "❌ Lỗi khi tải đánh giá:",
        error.response?.data || error.message
      );
      let errorMessage = "Không thể tải đánh giá. Vui lòng thử lại.";
      if (error.response && error.response.status === 500) {
        errorMessage =
          "Lỗi server (500). Vui lòng kiểm tra sự kiện hoặc liên hệ quản trị viên.";
      }
      Alert.alert("Lỗi", errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (newReviewRating === 0 || !newReviewComment.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao và nhập bình luận.");
      return;
    }

    console.log("DEBUG - Gửi đánh giá với:");
    console.log("  eventId:", eventId);
    console.log("  rating:", newReviewRating);
    console.log("  comment:", newReviewComment.trim());
    const payload = {
      event: eventId,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    };
    console.log("DEBUG - Payload gửi lên server:", payload);

    setSubmittingReview(true);
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }
      console.log("DEBUG - Token:", token);
      const api = authApi(token);
      const res = await api.post(
        endpoints["create-event-review"](eventId),
        payload
      );

      console.log("DEBUG - Response từ server:", res.data);
      if (res.status === 201) {
        Alert.alert("Thành công", "Đánh giá của bạn đã được gửi.");
        setNewReviewRating(0);
        setNewReviewComment("");
        fetchEventReviews();
      } else {
        console.error("Lỗi khi gửi đánh giá (phản hồi server):", res.data);
        const errorMessage =
          res.data?.detail || res.data?.message || "Không thể gửi đánh giá.";
        Alert.alert("Lỗi", errorMessage);
      }
    } catch (error) {
      console.error(
        "Lỗi khi gửi đánh giá (catch block):",
        error.response?.data || error.message || error.toString()
      );
      let errorMessage =
        "Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response.status === 500) {
          errorMessage =
            "Lỗi server (500). Vui lòng kiểm tra sự kiện hoặc liên hệ quản trị viên.";
        } else if (error.response.data) {
          if (error.response.data.event && error.response.data.event[0]) {
            errorMessage = `Sự kiện: ${error.response.data.event[0]}`;
          } else if (
            error.response.data.rating &&
            error.response.data.rating[0]
          ) {
            errorMessage = `Đánh giá (số sao): ${error.response.data.rating[0]}`;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitReply = async (reviewId) => {
    if (!newReplyComment.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung phản hồi.");
      return;
    }
    if (!loggedInUser) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để phản hồi.");
      navigation.navigate("AuthStack", { screen: "Login" });
      return;
    }

    setSubmittingReply(true);
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }
      const api = authApi(token);

      const userResponse = await api.get(endpoints["currentUser"]);
      console.log("DEBUG - Dữ liệu người dùng hiện tại:", userResponse.data); // Thêm dòng này
      const userRole = userResponse.data.role;
      if (userRole !== "organizer") {
        Alert.alert("Lỗi", "Chỉ nhà tổ chức mới được phép phản hồi.");
        return;
      }

      const data = {
        reply_text: newReplyComment,
        review: reviewId,
      };
      const replyResponse = await api.post(
        endpoints["create-review-reply"](reviewId),
        data
      );

      Alert.alert("Thành công", "Phản hồi của bạn đã được gửi!");
      setNewReplyComment("");
      setReplyingToReviewId(null);
      fetchEventReviews();
    } catch (error) {
      console.error(
        "Lỗi khi gửi phản hồi:",
        error.response?.data || error.message
      );
      let errorMessage = "Không thể gửi phản hồi.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response.status === 500) {
          errorMessage =
            "Lỗi server (500). Vui lòng kiểm tra hoặc liên hệ quản trị viên.";
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {item.user_info?.avatar ? (
          <Image
            source={{ uri: item.user_info.avatar }}
            style={styles.reviewAvatar}
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={colors.primary}
          />
        )}
        <View style={styles.reviewUserContent}>
          <Text style={styles.reviewUsername}>
            {item.user_info?.username || "Ẩn danh"}
          </Text>
          <StarRating rating={item.rate} setRating={() => {}} size={18} />
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.content}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.created_date).toLocaleDateString()} lúc{" "}
        {new Date(item.created_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesHeader}>
            Phản hồi ({item.replies.length})
          </Text>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              {reply.user_info?.avatar ? (
                <Image
                  source={{ uri: reply.user_info.avatar }}
                  style={styles.replyAvatar}
                />
              ) : (
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={colors.secondary}
                />
              )}
              <View style={styles.replyContent}>
                <Text style={styles.replyUsername}>
                  {reply.user_info?.username || "Ẩn danh"}
                </Text>
                <Text style={styles.replyText}>{reply.reply_text}</Text>
                <Text style={styles.replyDate}>
                  {new Date(reply.created_date).toLocaleDateString()} lúc{" "}
                  {new Date(reply.created_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {loggedInUser && (
        <TouchableOpacity
          style={styles.toggleReplyButton}
          onPress={() =>
            setReplyingToReviewId(
              replyingToReviewId === item.id ? null : item.id
            )
          }
        >
          <Ionicons
            name="arrow-undo-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.toggleReplyButtonText}>
            {replyingToReviewId === item.id ? "Hủy phản hồi" : "Phản hồi"}
          </Text>
        </TouchableOpacity>
      )}

      {replyingToReviewId === item.id && (
        <View style={styles.replyFormContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Viết phản hồi của bạn..."
            placeholderTextColor={colors.secondary}
            value={newReplyComment}
            onChangeText={setNewReplyComment}
            multiline
          />
          <TouchableOpacity
            style={styles.submitReplyButton}
            onPress={() => submitReply(item.id)}
            disabled={submittingReply}
          >
            {submittingReply ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitReplyButtonText}>Gửi phản hồi</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 60 + insets.top },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBackButton, { paddingTop: insets.top }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá & Bình luận</Text>
      </View>

      {loggedInUser ? (
        <View style={styles.reviewFormCard}>
          <Text style={styles.cardSectionTitle}>Gửi đánh giá của bạn</Text>
          <StarRating
            rating={newReviewRating}
            setRating={setNewReviewRating}
            size={35}
          />
          <TextInput
            style={styles.reviewInput}
            placeholder="Chia sẻ trải nghiệm của bạn về sự kiện..."
            placeholderTextColor={colors.secondary}
            value={newReviewComment}
            onChangeText={setNewReviewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitReview}
            disabled={submittingReview}
          >
            {submittingReview ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginPromptCard}>
          <Text style={styles.loginPromptText}>
            Bạn cần đăng nhập để gửi đánh giá và phản hồi.
          </Text>
          <TouchableOpacity
            style={styles.loginPromptButton}
            onPress={() =>
              navigation.navigate("AuthStack", { screen: "Login" })
            }
          >
            <Text style={styles.loginPromptButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReviewItem}
          ListHeaderComponent={() => (
            <>
              <Text style={styles.overallReviewsTitle}>Tất cả đánh giá</Text>
              {reviews.length === 0 && (
                <Text style={styles.noReviewsText}>
                  Chưa có đánh giá nào cho sự kiện này.
                </Text>
              )}
            </>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    height: 60,
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerBackButton: {
    position: "absolute",
    left: 15,
    top: 0,
    paddingTop: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 20,
    color: colors.white,
    fontFamily: fonts.Bold,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  loadingText: {
    marginTop: 10,
    color: colors.secondary,
    fontFamily: fonts.Regular,
  },
  flatListContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  overallReviewsTitle: {
    fontSize: 20,
    fontFamily: fonts.Bold,
    color: colors.white,
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  noReviewsText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 20,
    fontFamily: fonts.Regular,
  },
  starRatingContainer: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  starIcon: {
    marginHorizontal: 2,
  },
  reviewFormCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardSectionTitle: {
    fontSize: 18,
    color: colors.white,
    fontFamily: fonts.SemiBold,
    marginBottom: 15,
    textAlign: "center",
  },
  reviewInput: {
    backgroundColor: colors.base,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: "top",
    color: colors.white,
    fontFamily: fonts.Regular,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  submitButton: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: 17,
  },
  loginPromptCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loginPromptText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fonts.Regular,
    marginBottom: 15,
    textAlign: "center",
  },
  loginPromptButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginPromptButtonText: {
    color: colors.white,
    fontFamily: fonts.SemiBold,
    fontSize: 15,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.green,
  },
  reviewUserContent: {
    flex: 1,
  },
  reviewUsername: {
    fontSize: 17,
    fontFamily: fonts.SemiBold,
    color: colors.green,
  },
  reviewComment: {
    fontSize: 15,
    fontFamily: fonts.Regular,
    color: colors.white,
    marginTop: 5,
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: fonts.Light,
    color: colors.secondary,
    textAlign: "right",
    borderTopWidth: 0.5,
    borderTopColor: colors.gray,
    paddingTop: 5,
    marginTop: 5,
  },
  repliesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  repliesHeader: {
    fontSize: 16,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
    marginBottom: 10,
  },
  replyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.base,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  replyContent: {
    flex: 1,
  },
  replyUsername: {
    fontSize: 14,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
  },
  replyText: {
    fontSize: 14,
    fontFamily: fonts.Regular,
    color: colors.white,
    marginTop: 2,
    lineHeight: 20,
  },
  replyDate: {
    fontSize: 10,
    fontFamily: fonts.Light,
    color: colors.secondary,
    textAlign: "right",
    marginTop: 5,
  },
  toggleReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  toggleReplyButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
  },
  replyFormContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  replyInput: {
    backgroundColor: colors.base,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    minHeight: 70,
    textAlignVertical: "top",
    color: colors.white,
    fontFamily: fonts.Regular,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  submitReplyButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  submitReplyButtonText: {
    color: colors.white,
    fontFamily: fonts.Bold,
    fontSize: 15,
  },
});

export default Reviews;
