import axios from "axios";

const BASE_URL = "https://mynameisgiao.pythonanywhere.com/";

export const endpoints = {
  login: "/o/token/",
  currentUser: "/users/current-user/",
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
