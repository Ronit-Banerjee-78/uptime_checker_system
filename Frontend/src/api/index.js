import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7180",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 → clear token and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("uptime_user");
      window.location.href = "/login";
    }
    const msg =
      err.response?.data?.error || err.message || "Something went wrong";
    return Promise.reject(new Error(msg));
  },
);

export const authApi = {
  register: (data) => API.post("/user/register", data),
  login: (data) => API.post("/user/login", data),
  // logout: () => API.post("/user/logout", ),
  me: () => API.get("/user/me"),
};

export const monitorsApi = {
  getAll: () => API.get("/monitors"),
  create: (data) => API.post("/monitors", data),
  update: (id, data) => API.patch(`/monitors/${id}`, data),
  remove: (id) => API.delete(`/monitors/${id}`),
};

export const logsApi = {
  getOverview: () => API.get("/logs/overview/all"),
  getLogs: (id) => API.get(`/logs/${id}`),
  getSummary: (id, days = 30) =>
    API.get(`/logs/${id}/summary`, { params: { days } }),
  getIncidents: (id) => API.get(`/logs/${id}/incidents`),
};

export const healthApi = {
  check: () => API.get("/health"),
};

export default API;
