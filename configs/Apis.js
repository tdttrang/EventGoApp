import axios from "axios";

const BASE_URL = "https://mynameisgiao.pythonanywhere.com/";

export const endpoints = {
  login: "/o/token/",
  currentUser: "/current-user/profile/",
  // Endpoints cho đánh giá và phản hồi
  "create-event-review": (eventId) => `/events/${eventId}/reviews/`,
  "event-review-list": (eventId) => `/events/${eventId}/reviews/list/`,
  "create-review-reply": (reviewId) => `/events/reviews/${reviewId}/reply/`,
  "review-reply-list": (reviewId) => `/events/reviews/${reviewId}/replies/`,
  // Endpoint mới cho chi tiết sự kiện
  "event-detail": (eventId) => `/events/${eventId}/`,
  // Endpoint cho thông báo
  "create-notification": "/notifications/create/",
  "list-notifications": "/notifications/",
  "mark-read": (id) => `/notifications/${id}/read/`,
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
