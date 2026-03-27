import { useState, useEffect } from "react";
import { storage } from "@/utils/storage";
import { useGeofenceStore } from "@/utils/geofenceStore";

export function useMapScreenState() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isFocused, setIsFocused] = useState(true);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isActivityRunning, setIsActivityRunning] = useState(false);
  const [geofenceMode, setGeofenceMode] = useState(null);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const {
    showGeofenceForm,
    setShowGeofenceForm,
    geofenceLocation,
    setGeofenceLocation,
  } = useGeofenceStore();

  // Load notification preference from storage
  useEffect(() => {
    (async () => {
      const saved = await storage.getItem("notificationsEnabled");
      if (saved !== null) {
        setNotificationsEnabled(JSON.parse(saved));
      }
    })();
  }, []);

  // Clear geofence state when group changes
  useEffect(() => {
    setGeofenceMode(null);
    setGeofenceLocation(null);
    setShowGeofenceForm(false);
  }, [selectedGroup?.id, setGeofenceLocation, setShowGeofenceForm]);

  return {
    selectedGroup,
    setSelectedGroup,
    isFocused,
    setIsFocused,
    showGroupSelector,
    setShowGroupSelector,
    notificationsEnabled,
    setNotificationsEnabled,
    isActivityRunning,
    setIsActivityRunning,
    geofenceMode,
    setGeofenceMode,
    showMemberPicker,
    setShowMemberPicker,
    showGeofenceForm,
    setShowGeofenceForm,
    geofenceLocation,
    setGeofenceLocation,
  };
}
