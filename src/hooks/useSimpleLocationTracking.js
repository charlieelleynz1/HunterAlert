import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { Alert, Platform } from "react-native";

/**
 * Battery-efficient location tracking with 50% duty cycle:
 * 1. Requests ALWAYS permission (foreground + background)
 * 2. GPS active for 10 seconds, then idle for 10 seconds
 * 3. Sends updates immediately when moved
 * 4. Heartbeat updates every 60s when stationary
 */
export function useSimpleLocationTracking(memberId, isOnline) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geofenceStatus, setGeofenceStatus] = useState(null);
  const [intruderStatus, setIntruderStatus] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const subscriptionRef = useRef(null);
  const cycleIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const stationaryCount = useRef(0);
  const lastPositionRef = useRef(null);
  const lastServerUpdateRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // CRITICAL: Don't run location tracking on web - expo-location is native-only
    if (Platform.OS === "web") {
      console.log("📍 Location tracking disabled on web platform");
      return;
    }

    if (!memberId || !isOnline) {
      console.log("🛑 TRACKING: Stopped", {
        hasMemberId: !!memberId,
        isOnline,
      });

      // Stop tracking
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setIsTrackingActive(false);

      // CRITICAL FIX: DON'T clear breach status - let alarm complete
      // Only clear location tracking state, preserve breach state for alarm continuity
      // The user will dismiss the alarm manually by pressing OK
      console.log("⏸️ TRACKING: Paused - PRESERVING breach state for alarm");

      setCurrentLocation(null);
      setLastUpdateTime(null);
      lastPositionRef.current = null;
      stationaryCount.current = 0;

      return;
    }

    console.log(
      "🚀 TRACKING: Starting battery-saving tracking for member",
      memberId,
    );

    const startTracking = async () => {
      try {
        // Request foreground permissions first
        const foregroundStatus =
          await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus.status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "This app needs location permission to track your adventure and keep you safe.",
          );
          return;
        }

        console.log("✅ Foreground location permission granted");

        // Request background permissions for continuous tracking when app is backgrounded
        const backgroundStatus =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status === "granted") {
          console.log(
            "✅ Background location permission granted - tracking works when app is in background",
          );
        } else {
          console.log(
            "⚠️ Background permission not granted, tracking only works while app is open",
          );
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };

        lastPositionRef.current = coords;
        setCurrentLocation(coords);
        setLastUpdateTime(Date.now());
        console.log("📍 Initial location:", coords);

        // Send initial location to server
        await sendLocationUpdate(memberId, coords);
        lastServerUpdateRef.current = Date.now();

        // Heartbeat mechanism - send update every 60 seconds if no movement
        heartbeatIntervalRef.current = setInterval(async () => {
          if (!mountedRef.current) return;

          const timeSinceLastUpdate = Date.now() - lastServerUpdateRef.current;
          const shouldSendHeartbeat = timeSinceLastUpdate >= 60000; // 60 seconds

          if (shouldSendHeartbeat && lastPositionRef.current) {
            console.log("💓 HEARTBEAT: Sending keep-alive update");
            await sendLocationUpdate(memberId, lastPositionRef.current);
            lastServerUpdateRef.current = Date.now();
          }
        }, 15000); // Check every 15 seconds if heartbeat is needed

        // Battery-saving cycle: 10s active, 10s idle
        const startActivePhase = async () => {
          if (!mountedRef.current) return;

          console.log("🟢 GPS ACTIVE (10 seconds)");
          setIsTrackingActive(true);

          // Start GPS tracking
          subscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000, // Every 5 seconds
              distanceInterval: 20, // Or 20 meters moved
            },
            async (location) => {
              if (!mountedRef.current) return;

              const newCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };

              // Use ref instead of state to avoid stale closure
              const hasMoved = lastPositionRef.current
                ? getDistance(
                    lastPositionRef.current.latitude,
                    lastPositionRef.current.longitude,
                    newCoords.latitude,
                    newCoords.longitude,
                  ) > 30
                : true;

              if (hasMoved) {
                console.log("🏃 MOVED - Updating location");
                stationaryCount.current = 0;
                lastPositionRef.current = newCoords;
                setCurrentLocation(newCoords);
                setLastUpdateTime(Date.now());
                await sendLocationUpdate(memberId, newCoords);
                lastServerUpdateRef.current = Date.now();
              } else {
                stationaryCount.current++;
                // Update local state always, but server updates handled by heartbeat
                lastPositionRef.current = newCoords;
                setCurrentLocation(newCoords);

                // Send first few stationary updates immediately for responsiveness
                if (stationaryCount.current <= 2) {
                  console.log(
                    "🚶 STATIONARY - Initial update #",
                    stationaryCount.current,
                  );
                  setLastUpdateTime(Date.now());
                  await sendLocationUpdate(memberId, newCoords);
                  lastServerUpdateRef.current = Date.now();
                } else {
                  console.log(
                    "💤 STATIONARY - Heartbeat will handle server updates",
                  );
                }
              }
            },
          );

          // Stop GPS after 10 seconds
          setTimeout(() => {
            if (subscriptionRef.current && mountedRef.current) {
              subscriptionRef.current.remove();
              subscriptionRef.current = null;
              console.log("🔴 GPS IDLE (10 seconds)");
              setIsTrackingActive(false);
            }
          }, 10000);
        };

        // Start first active phase
        await startActivePhase();

        // Repeat every 20 seconds (10s active + 10s idle)
        cycleIntervalRef.current = setInterval(async () => {
          if (mountedRef.current) {
            await startActivePhase();
          }
        }, 20000);

        console.log(
          "✅ Battery-saving tracking cycle started (10s active / 10s idle)",
        );
      } catch (error) {
        console.error("❌ Tracking error:", error);
        Alert.alert(
          "Tracking Error",
          "Failed to start location tracking: " + error.message,
        );
      }
    };

    startTracking();
  }, [memberId, isOnline]);

  // Send location to server and get breach status
  const sendLocationUpdate = async (memberId, coords) => {
    try {
      console.log("📤 Sending location to server");

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      if (!response.ok) {
        console.error("❌ Server returned error:", response.status);
        return;
      }

      const data = await response.json();

      console.log("✅ Server response:", {
        zonesEntered: data.geofenceStatus?.count || 0,
        intruders: data.intruderStatus?.count || 0,
      });

      // ENHANCED DEBUG LOGGING - Show full breach data
      console.log(
        "🔍 FULL SERVER RESPONSE DATA:",
        JSON.stringify(data, null, 2),
      );

      console.log("📊 GEOFENCE STATUS DETAILS:", {
        hasGeofenceStatus: !!data.geofenceStatus,
        isInside: data.geofenceStatus?.isInside,
        count: data.geofenceStatus?.count,
        geofences: data.geofenceStatus?.geofences,
      });

      console.log("📊 INTRUDER STATUS DETAILS:", {
        hasIntruderStatus: !!data.intruderStatus,
        hasIntruders: data.intruderStatus?.hasIntruders,
        count: data.intruderStatus?.count,
        intruders: data.intruderStatus?.intruders,
      });

      if (data.geofenceStatus?.count > 0) {
        console.log(
          "🚨 YOU ENTERED ZONES:",
          data.geofenceStatus.geofences.map((g) => g.name),
        );
      }

      if (data.intruderStatus?.count > 0) {
        console.log(
          "🚨 INTRUDERS IN YOUR ZONE:",
          data.intruderStatus.intruders.map((i) => i.name),
        );
      }

      console.log("💾 Setting breach state in React...");
      setGeofenceStatus(data.geofenceStatus);
      setIntruderStatus(data.intruderStatus);
      console.log("✅ Breach state updated!");
    } catch (error) {
      console.error("❌ Failed to send location:", error);
    }
  };

  return {
    currentLocation,
    geofenceStatus,
    intruderStatus,
    isTrackingActive,
    lastUpdateTime,
  };
}

// Calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
