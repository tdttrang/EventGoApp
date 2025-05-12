import axios from "axios";

const API_BASE_URL = "https://mynameisgiao.pythonanywhere.com/api/";
export const AuthEndpoints = {
  LOGIN: `${API_BASE_URL}auth/login/`,
  REGISTER: `${API_BASE_URL}auth/register/`,
  PROFILE: `${API_BASE_URL}auth/profile/`,
};
export const EventEndpoints = {
  CREATE: `${API_BASE_URL}events/create/`,
  LIST: `${API_BASE_URL}events/`,
  DETAILS: (id) => `${API_BASE_URL}events/${id}/`,
  UPLOAD: (id) => `${API_BASE_URL}events/${id}/upload/`,
};
export const TicketEndpoints = {
  BOOK: `${API_BASE_URL}tickets/book/`,
  HISTORY: `${API_BASE_URL}tickets/`,
};
