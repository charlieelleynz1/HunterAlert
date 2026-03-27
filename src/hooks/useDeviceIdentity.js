import { useState, useEffect } from "react";
import { storage } from "@/utils/storage";

// Generate a unique device ID for this user
function generateDeviceId() {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function useDeviceIdentity() {
  const [deviceId, setDeviceId] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeviceIdentity();
  }, []);

  const loadDeviceIdentity = async () => {
    try {
      // Check if we have a device ID
      let storedDeviceId = await storage.getItem("device_id");

      if (storedDeviceId) {
        // Validate that this device ID still exists on the server
        try {
          const response = await fetch(
            `/api/members?device_id=${storedDeviceId}`,
          );
          if (response.ok) {
            const data = await response.json();
            // If device exists on server, use it
            if (data.members && data.members.length > 0) {
              setDeviceId(storedDeviceId);
            } else {
              // Device ID not found on server, generate new one
              console.log(
                "Stored device ID not found on server, generating new one...",
              );
              storedDeviceId = generateDeviceId();
              await storage.setItem("device_id", storedDeviceId);
              setDeviceId(storedDeviceId);
            }
          } else {
            // Server error, keep using stored ID
            setDeviceId(storedDeviceId);
          }
        } catch (error) {
          // Network error, keep using stored ID
          console.error("Error validating device ID:", error);
          setDeviceId(storedDeviceId);
        }
      } else {
        // Generate and save a new device ID
        storedDeviceId = generateDeviceId();
        await storage.setItem("device_id", storedDeviceId);
        setDeviceId(storedDeviceId);
      }

      // Load saved user name
      const storedUserName = await storage.getItem("user_name");
      setUserName(storedUserName || "");
    } catch (error) {
      console.error("Error loading device identity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserName = async (name) => {
    try {
      await storage.setItem("user_name", name);
      setUserName(name);
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  };

  return {
    deviceId,
    userName,
    isLoading,
    saveUserName,
  };
}
