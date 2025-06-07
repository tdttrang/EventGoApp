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
  // Endpoint cho thống kê
  total_attendees: "/api/admin/statistics/total_attendees/",
  event_total: "/api/events/",
  event_time_statistics: "/api/admin/events/statistics/by_time/",
  attendees_time_statistics: "/api/admin/attendees/statistics/by_time/",

  // Endpoints cho organizer
  organizer_event_sold_tickets: (eventId) =>
    `/api/organizer/events/${eventId}/statistics/sold_tickets/`,
  organizer_event_total_revenue: (eventId) =>
    `/api/organizer/events/${eventId}/statistics/total_revenue/`,
  organizer_event_reviews_with_replies: (eventId) =>
    `/api/organizer/events/${eventId}/reviews-with-replies/`,
  organizer_event_time_statistics: "/organizer/events/statistics/by_time/",
  organizer_attendees_by_time: "/organizer/attendees/statistics/by_time/",
  // quản lý
  events: "/events/",
  admin_users: "/api/admin/users/",
  admin_tickets: "/api/admin/tickets/",
  admin_notifications: "/api/admin/notifications/",
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
