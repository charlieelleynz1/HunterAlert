import { create } from "zustand";

export const useGeofenceStore = create((set) => ({
  showGeofenceForm: false,
  setShowGeofenceForm: (show) => set({ showGeofenceForm: show }),
  geofenceLocation: null,
  setGeofenceLocation: (location) => set({ geofenceLocation: location }),
  resetGeofenceMode: () =>
    set({ showGeofenceForm: false, geofenceLocation: null }),
}));
