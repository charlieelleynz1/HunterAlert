import { Platform } from "react-native";

export const storage = {
  async getItem(key) {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch {}
      return;
    }
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch {}
      return;
    }
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return AsyncStorage.removeItem(key);
  },
  async getAllKeys() {
    if (Platform.OS === "web") {
      try {
        return Object.keys(localStorage);
      } catch {
        return [];
      }
    }
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return AsyncStorage.getAllKeys();
  },
};

export const clearAllAppData = async () => {
  try {
    const allKeys = await storage.getAllKeys();
    const appKeys = allKeys.filter(
      (key) =>
        key.startsWith("device_id") ||
        key.startsWith("user_name") ||
        key.startsWith("member_identity_") ||
        key.startsWith("tracking_") ||
        key.startsWith("selected_group") ||
        key === "secure_pin_hash" ||
        key === "notificationsEnabled",
    );

    if (Platform.OS === "web") {
      appKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      });
    } else {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.multiRemove(appKeys);
    }

    console.log("Cleared all app data:", appKeys);
    return appKeys.length;
  } catch (error) {
    console.error("Error clearing app data:", error);
    throw error;
  }
};

// Guest session limit management (3 sessions max for guests)
export const getGuestSessionCount = async () => {
  try {
    const count = await storage.getItem("guest_session_count");
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Error getting guest session count:", error);
    return 0;
  }
};

export const incrementGuestSessionCount = async () => {
  try {
    const currentCount = await getGuestSessionCount();
    const newCount = currentCount + 1;
    await storage.setItem("guest_session_count", newCount.toString());
    console.log(`📊 Guest session count: ${newCount}/3`);
    return newCount;
  } catch (error) {
    console.error("Error incrementing guest session count:", error);
    const fallbackCount = await getGuestSessionCount();
    return fallbackCount;
  }
};

export const clearGuestSessionCount = async () => {
  try {
    await storage.removeItem("guest_session_count");
    console.log("✅ Guest session count cleared - account linked!");
  } catch (error) {
    console.error("Error clearing guest session count:", error);
  }
};

export const hasReachedGuestLimit = async () => {
  const count = await getGuestSessionCount();
  return count >= 3;
};
