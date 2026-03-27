import { useState, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import * as Location from "expo-location";
import { sosEmergency } from "@/utils/sosEmergency";
import { resetState } from "@/utils/resetState";

export function useLocationTracking(
  selectedMemberId,
  isOnline,
  queueLocationUpdate,
  shouldTrack = true, // Renamed from isFocused for clarity
) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geofenceStatus, setGeofenceStatus] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(true); // Track if currently in active phase
  const subscriptionRef = useRef(null);
  const stationaryCount = useRef(0);
  const cycleIntervalRef = useRef(null);
  // CRITICAL FIX: Use ref to track latest location for distance calculations
  const currentLocationRef = useRef(null);

  // Update ref whenever location state changes
  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  useEffect(() => {
    // CRITICAL: Don't run location tracking on web - expo-location is native-only
    if (Platform.OS === "web") {
      console.log("📍 Location tracking disabled on web platform");
      return;
    }

    let mounted = true;

    console.log("🎯 TRACKING HOOK: Effect triggered", {
      selectedMemberId,
      shouldTrack,
      isOnline,
      mounted,
    });

    // Register SOS emergency listener to stop tracking immediately
    const unregisterSOS = sosEmergency.onActivate(() => {
      console.log(
        "📍 Location tracking: SOS activated - stopping all tracking",
      );
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    });

    // Register reset listener to stop tracking immediately
    const unregisterReset = resetState.onChange((isActive) => {
      if (isActive) {
        console.log(
          "📍 Location tracking: Reset activated - stopping all tracking",
        );
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }
        if (cycleIntervalRef.current) {
          clearInterval(cycleIntervalRef.current);
          cycleIntervalRef.current = null;
        }
      }
    });

    const startTracking = async () => {
      // Only track if member is selected and tracking is enabled
      if (!selectedMemberId || !shouldTrack) {
        console.log("📍 TRACKING: Not starting -", {
          hasMember: !!selectedMemberId,
          shouldTrack,
        });
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }
        if (cycleIntervalRef.current) {
          clearInterval(cycleIntervalRef.current);
          cycleIntervalRef.current = null;
        }
        return;
      }

      // Don't start tracking if reset is active
      if (resetState.isActive()) {
        console.log("📍 Location tracking blocked: Reset in progress");
        return;
      }

      console.log(
        "🚀 TRACKING: Starting location tracking for member",
        selectedMemberId,
      );

      try {
        // Check if SOS is active before starting
        sosEmergency.checkAndAbort("Location tracking");

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("❌ TRACKING: Location permission denied");
          Alert.alert(
            "Permission needed",
            "Location permission is required for this app",
          );
          return;
        }

        console.log("✅ TRACKING: Location permission granted");

        // Request background permissions for continuous tracking
        const bgStatus = await Location.requestBackgroundPermissionsAsync();
        console.log(
          "📍 TRACKING: Background permission status:",
          bgStatus.status,
        );

        if (!mounted) return;

        // Get initial location with balanced accuracy
        console.log("📍 TRACKING: Getting initial location...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          const initialCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(initialCoords);
          currentLocationRef.current = initialCoords; // Initialize ref
          console.log("✅ TRACKING: Initial location acquired", {
            lat: location.coords.latitude.toFixed(4),
            lng: location.coords.longitude.toFixed(4),
          });
        }

        // Battery-saving cycle: 10s active, 10s idle, repeating every 20s
        const startActivePhase = async () => {
          if (!mounted || resetState.isActive() || sosEmergency.isActive()) {
            return;
          }

          console.log("🟢 Starting ACTIVE tracking phase (10 seconds)");
          setIsTrackingActive(true);

          // Start GPS tracking for 10 seconds
          subscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000, // Update every 5 seconds during active phase
              distanceInterval: 20, // Update when moved 20 meters
            },
            async (newLocation) => {
              console.log("🎯 GPS UPDATE RECEIVED:", {
                lat: newLocation.coords.latitude.toFixed(6),
                lng: newLocation.coords.longitude.toFixed(6),
                timestamp: new Date().toISOString(),
              });

              // CRITICAL: Check if reset is active - abort immediately
              if (resetState.isActive()) {
                console.log("📍 Location update blocked: Reset in progress");
                if (subscriptionRef.current) {
                  subscriptionRef.current.remove();
                  subscriptionRef.current = null;
                }
                return;
              }

              // Check if SOS emergency is active - abort if so
              if (sosEmergency.isActive()) {
                console.log("📍 Location update skipped: SOS emergency active");
                if (subscriptionRef.current) {
                  subscriptionRef.current.remove();
                  subscriptionRef.current = null;
                }
                return;
              }

              if (mounted) {
                const newCoords = {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                };

                // CRITICAL FIX: Use ref instead of stale state
                const lastLocation = currentLocationRef.current;
                const hasMoved = lastLocation
                  ? getDistance(
                      lastLocation.latitude,
                      lastLocation.longitude,
                      newCoords.latitude,
                      newCoords.longitude,
                    ) > 30
                  : true;

                console.log("📏 Movement check:", {
                  hasMoved,
                  stationaryCount: stationaryCount.current,
                  willSendUpdate: hasMoved || stationaryCount.current <= 3,
                  selectedMemberId,
                  lastLat: lastLocation?.latitude.toFixed(6),
                  lastLng: lastLocation?.longitude.toFixed(6),
                  newLat: newCoords.latitude.toFixed(6),
                  newLng: newCoords.longitude.toFixed(6),
                });

                if (hasMoved) {
                  stationaryCount.current = 0;
                  setCurrentLocation(newCoords);
                  currentLocationRef.current = newCoords; // Update ref

                  if (selectedMemberId && !resetState.isActive()) {
                    const locationUpdate = {
                      memberId: selectedMemberId,
                      ...newCoords,
                    };
                    console.log(
                      "🚀 CALLING queueLocationUpdate with:",
                      locationUpdate,
                    );
                    const result = await queueLocationUpdate(locationUpdate);
                    console.log("✅ queueLocationUpdate returned:", result);

                    if (result?.geofenceStatus) {
                      setGeofenceStatus(result.geofenceStatus);
                    }
                  } else {
                    console.log("⚠️ NOT calling queueLocationUpdate:", {
                      hasSelectedMember: !!selectedMemberId,
                      selectedMemberId,
                      resetActive: resetState.isActive(),
                    });
                  }
                  console.log("📍 Location updated (moved)");
                } else {
                  stationaryCount.current++;

                  // If stationary for 3+ updates, reduce updates
                  if (stationaryCount.current <= 3) {
                    setCurrentLocation(newCoords);
                    currentLocationRef.current = newCoords; // Update ref

                    if (selectedMemberId && !resetState.isActive()) {
                      const locationUpdate = {
                        memberId: selectedMemberId,
                        ...newCoords,
                      };
                      console.log(
                        "🚀 CALLING queueLocationUpdate (stationary) with:",
                        locationUpdate,
                      );
                      const result = await queueLocationUpdate(locationUpdate);
                      console.log("✅ queueLocationUpdate returned:", result);

                      if (result?.geofenceStatus) {
                        setGeofenceStatus(result.geofenceStatus);
                      }
                    } else {
                      console.log(
                        "⚠️ NOT calling queueLocationUpdate (stationary):",
                        {
                          hasSelectedMember: !!selectedMemberId,
                          selectedMemberId,
                          resetActive: resetState.isActive(),
                        },
                      );
                    }
                    console.log("📍 Location updated (stationary check)");
                  } else {
                    // Skip network update but keep UI updated
                    setCurrentLocation(newCoords);
                    currentLocationRef.current = newCoords; // Update ref even when stationary
                    console.log("💤 Skipping network update - stationary");
                  }
                }
              }
            },
          );

          // After 10 seconds, stop GPS and enter idle phase
          setTimeout(() => {
            if (subscriptionRef.current && mounted) {
              subscriptionRef.current.remove();
              subscriptionRef.current = null;
              console.log("🔴 Stopping GPS - entering IDLE phase (10 seconds)");
              setIsTrackingActive(false);
            }
          }, 10000); // 10 seconds active
        };

        // Start the first active phase
        await startActivePhase();

        // Repeat cycle every 20 seconds (10s active + 10s idle)
        cycleIntervalRef.current = setInterval(async () => {
          if (mounted && !resetState.isActive() && !sosEmergency.isActive()) {
            await startActivePhase();
          }
        }, 20000); // Total cycle: 20 seconds

        console.log(
          "✅ Battery-saving tracking cycle started (10s active / 10s idle)",
        );
      } catch (error) {
        if (error.code === "SOS_ABORT") {
          console.log("📍 Location tracking startup aborted for SOS emergency");
        } else {
          console.error("Error starting location tracking:", error);
        }
      }
    };

    startTracking();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      unregisterSOS();
      unregisterReset();
    };
  }, [selectedMemberId, isOnline, queueLocationUpdate]);

  return { currentLocation, geofenceStatus, isTrackingActive };
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
