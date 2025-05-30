import axios from "axios";

const BASE_URL = "https://mynameisgiao.pythonanywhere.com/";

export const endpoints = {
  login: "/o/token/",
  currentUser: "/current-user/profile/",
  // Thêm các endpoints mới cho đánh giá và phản hồi
    "create-event-review": (eventId) => `/events/${eventId}/reviews/`,
  "event-review-list": (eventId) => `/events/${eventId}/reviews/list/`,
  "create-review-reply": (reviewId) => `events/reviews/${reviewId}/reply/`,
  "review-reply-list": (reviewId) => `/events/reviews/${reviewId}/replies/`,
};

export const authApi = (accessToken) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
});
