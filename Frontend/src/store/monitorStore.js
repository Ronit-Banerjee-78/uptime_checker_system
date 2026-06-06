import { create } from 'zustand';
import { monitorsApi, logsApi } from '../api';

export const useMonitorStore = create((set, get) => ({
  monitors: [],
  overview: [],
  loading: false,
  error: null,

  fetchMonitors: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await monitorsApi.getAll();
      set({ monitors: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await logsApi.getOverview();
      set({ overview: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addMonitor: async (formData) => {
    const { data } = await monitorsApi.create(formData);
    set((s) => ({ monitors: [...s.monitors, data] }));
    return data;
  },

  updateMonitor: async (id, updates) => {
    const { data } = await monitorsApi.update(id, updates);
    set((s) => ({
      monitors: s.monitors.map((m) => (m.id === id ? data : m)),
      overview: s.overview.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
    return data;
  },

  deleteMonitor: async (id) => {
    await monitorsApi.remove(id);
    set((s) => ({
      monitors: s.monitors.filter((m) => m.id !== id),
      overview: s.overview.filter((m) => m.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));
