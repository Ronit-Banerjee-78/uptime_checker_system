import { create } from "zustand";
import { authApi } from "../api/index.js";

const TOKEN_KEY = "authToken";
const USER_KEY = "uptime_user";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
  loading: false,
  error: null,

  register: async ({ name, email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      console.log("Login Response:", data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
