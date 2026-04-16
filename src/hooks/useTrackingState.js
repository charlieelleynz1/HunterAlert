import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { storage } from "@/utils/storage";
import { resetState } from "@/utils/resetState";

export function useTrackingState() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const initialMemberId = params.memberId ? parseInt(params.memberId) : null;

  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(initialMemberId);
  const [myGeofenceId, setMyGeofenceId] = useState(null);
  const [geofenceLoaded, setGeofenceLoaded] = useState(false);
  const memberSetTimeRef = useRef(null);

  // Load existing geofence ID from storage on mount
  useEffect(() => {
    const loadGeofenceId = async () => {
      if (currentMemberId) {
        try {
          const storedId = await storage.getItem(
            `geofence_id_${currentMemberId}`,
          );
          if (storedId) {
            console.log("📦 Loaded existing geofence ID:", storedId);
            setMyGeofenceId(parseInt(storedId));
          }
        } catch (error) {
          console.error("Error loading geofence ID:", error);
        }
      }
      setGeofenceLoaded(true);
    };
    loadGeofenceId();
  }, [currentMemberId]);

  // Reset state when params change
  useEffect(() => {
    if (params.memberId) {
      const memberId = parseInt(params.memberId);

      // Check if trying to start a new adventure while one is active
      if (currentMemberId && currentMemberId !== memberId) {
        Alert.alert(
          "Adventure Already Active",
          "You're currently tracking an adventure. Please stop and reset your current adventure before starting a new one.",
          [
            {
              text: "Go to Reset",
              onPress: () => {
                router.push("/(tabs)/reset");
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                router.push("/(tabs)");
              },
            },
          ],
        );
        return;
      }

      // Only set if no active adventure or same member
      if (!currentMemberId || currentMemberId === memberId) {
        console.log("🎯 TRACKING: Setting currentMemberId to", memberId);
        setCurrentMemberId(memberId);
        setSecondsAgo(0);
        setMyGeofenceId(null);
        setGeofenceLoaded(false);

        // Record when we set this member to prevent premature deletion detection
        memberSetTimeRef.current = Date.now();
        console.log(
          "⏱️ TRACKING: Member set timestamp recorded - 3s grace period active",
        );
      }
    }
  }, [params.memberId, currentMemberId]);

  // CRITICAL: Listen for reset state changes and clear immediately
  useEffect(() => {
    const unregister = resetState.onChange((isActive) => {
      if (isActive) {
        console.log(
          "🔄 TRACKING: Reset activated - clearing state immediately",
        );
        setCurrentMemberId(null);
        setSecondsAgo(0);
        setMyGeofenceId(null);
        memberSetTimeRef.current = null;

        // Navigate to home after a brief delay
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 300);
      }
    });
    return unregister;
  }, []);

  return {
    secondsAgo,
    setSecondsAgo,
    isFocused,
    setIsFocused,
    currentMemberId,
    setCurrentMemberId,
    myGeofenceId,
    setMyGeofenceId,
    geofenceLoaded,
    memberSetTimeRef,
  };
}
