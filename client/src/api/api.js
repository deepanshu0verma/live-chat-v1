import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// Set up axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions
export const signup = (userData) =>
  api.post("/signup", userData).then((response) => response.data);

export const login = (credentials) =>
  api.post("/login", credentials).then((response) => response.data);

export const getUsers = () =>
  api.get("/users").then((response) => response.data);
