import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import {
  MapPin,
  Users as UsersIcon,
  Navigation,
  Radio,
} from "lucide-react-native";
import { calculateMemberStatus } from "@/utils/geofenceCalculations";

export function MapViewWithMarkers({
  mapRef,
  currentLocation,
  onMapPress,
  geofencesData = [], // Default to empty array
  membersData = [], // Default to empty array
  geofenceLocation,
  colors,
  onGeofencePress,
  isActivityRunning,
  currentMemberId, // ID of the currently tracked member
  myGeofenceId, // (Not used anymore - using member_id instead)
}) {
  const hasAnimatedToLocation = useRef(false);
  const [lastGPSUpdate, setLastGPSUpdate] = useState(null);

  // Animation values for live GPS indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations when GPS updates
  useEffect(() => {
    if (currentLocation && currentMemberId) {
      setLastGPSUpdate(Date.now());

      // Quick pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Ripple effect
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      console.log("📍 GPS Update - Visual feedback triggered");
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, currentMemberId]);

  // Animate ONLY on first location - not every update (battery optimization)
  useEffect(() => {
    if (
      currentLocation &&
      mapRef?.current &&
      isActivityRunning &&
      !hasAnimatedToLocation.current
    ) {
      try {
        // Only animate once when activity starts
        mapRef.current.animateToRegion(
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          500,
        );
        hasAnimatedToLocation.current = true;
        console.log("🗺️ Map centered on initial location");
      } catch (error) {
        console.error("Error animating to region:", error);
      }
    }
  }, [
    currentLocation?.latitude,
    currentLocation?.longitude,
    mapRef,
    isActivityRunning,
  ]);

  // Reset animation flag when activity stops
  useEffect(() => {
    if (!isActivityRunning) {
      hasAnimatedToLocation.current = false;
    }
  }, [isActivityRunning]);

  // Ensure we have valid arrays
  const safeGeofences = Array.isArray(geofencesData) ? geofencesData : [];
  const safeMembers = Array.isArray(membersData) ? membersData : [];

  // Use current location for initial region if available, otherwise use a default
  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: -36.8485,
        longitude: 174.7633,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onPress={onMapPress}
      showsUserLocation={isActivityRunning}
      showsMyLocationButton={false}
      loadingEnabled={true}
      loadingIndicatorColor={colors?.primary || "#000000"}
      moveOnMarkerPress={false}
      followsUserLocation={isActivityRunning}
      showsCompass={true}
      toolbarEnabled={false}
    >
      {/* Geofence circles - only show if there are actual geofences */}
      {safeGeofences.length > 0 &&
        safeGeofences.map((geofence) => {
          if (!geofence?.id || !geofence?.latitude || !geofence?.longitude) {
            return null;
          }

          // CRITICAL: Use live GPS location if this geofence belongs to current member
          let geofenceLatitude, geofenceLongitude;
          const isMyGeofence = geofence.member_id === currentMemberId;

          if (isMyGeofence && currentLocation) {
            // Use LIVE GPS location for current member's geofence (instant updates)
            geofenceLatitude = currentLocation.latitude;
            geofenceLongitude = currentLocation.longitude;
            console.log(
              `🎯 CIRCLE: Using LIVE GPS for geofence ${geofence.id} (member ${currentMemberId}):`,
              {
                lat: geofenceLatitude.toFixed(6),
                lng: geofenceLongitude.toFixed(6),
              },
            );
          } else {
            // For other members, use their last known location from API
            const member = geofence.member_id
              ? safeMembers.find((m) => m.id === geofence.member_id)
              : null;
            geofenceLatitude = member?.latitude || geofence.latitude;
            geofenceLongitude = member?.longitude || geofence.longitude;
          }

          // Check if this is a hunter's geofence - find the member who owns it
          const member = geofence.member_id
            ? safeMembers.find((m) => m.id === geofence.member_id)
            : geofence.created_by
              ? safeMembers.find((m) => m.id === geofence.created_by)
              : null;

          // FIXED: Check member role directly
          const isHunterGeofence = member?.role === "hunter";

          return (
            <React.Fragment key={`geofence-group-${geofence.id}`}>
              {/* Main geofence circle */}
              <Circle
                key={`circle-${geofence.id}`}
                center={{
                  latitude: geofenceLatitude,
                  longitude: geofenceLongitude,
                }}
                radius={geofence.radius || 100}
                fillColor={
                  isHunterGeofence
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(59, 130, 246, 0.2)"
                }
                strokeColor={
                  isHunterGeofence
                    ? "rgba(239, 68, 68, 0.8)"
                    : "rgba(59, 130, 246, 0.8)"
                }
                strokeWidth={2}
              />

              {/* Animated ripple for live GPS tracking (only for my geofence) */}
              {isMyGeofence && currentLocation && (
                <Circle
                  key={`ripple-${geofence.id}`}
                  center={{
                    latitude: geofenceLatitude,
                    longitude: geofenceLongitude,
                  }}
                  radius={(geofence.radius || 100) * 0.7}
                  fillColor="rgba(16, 185, 129, 0.1)"
                  strokeColor="rgba(16, 185, 129, 0.6)"
                  strokeWidth={1}
                />
              )}
            </React.Fragment>
          );
        })}

      {/* Geofence markers */}
      {safeGeofences.length > 0 &&
        safeGeofences.map((geofence) => {
          if (!geofence?.id || !geofence?.latitude || !geofence?.longitude) {
            return null;
          }

          // CRITICAL: Use live GPS location if this geofence belongs to current member (SAME as circles)
          let geofenceLatitude, geofenceLongitude;
          const isMyGeofence = geofence.member_id === currentMemberId;

          if (isMyGeofence && currentLocation) {
            // Use LIVE GPS location for my geofence marker
            geofenceLatitude = currentLocation.latitude;
            geofenceLongitude = currentLocation.longitude;
            console.log(
              `📍 MARKER: Using LIVE GPS for geofence ${geofence.id} (member ${currentMemberId}):`,
              {
                lat: geofenceLatitude.toFixed(6),
                lng: geofenceLongitude.toFixed(6),
              },
            );
          } else {
            // For other members, use their last known location from API
            const member = geofence.member_id
              ? safeMembers.find((m) => m.id === geofence.member_id)
              : null;
            geofenceLatitude = member?.latitude || geofence.latitude;
            geofenceLongitude = member?.longitude || geofence.longitude;
          }

          // Check if this is a hunter's geofence - find the member who owns it
          const member = geofence.member_id
            ? safeMembers.find((m) => m.id === geofence.member_id)
            : geofence.created_by
              ? safeMembers.find((m) => m.id === geofence.created_by)
              : null;

          // FIXED: Check member role directly
          const isHunterGeofence = member?.role === "hunter";

          return (
            <Marker
              key={`marker-${geofence.id}`}
              coordinate={{
                latitude: geofenceLatitude,
                longitude: geofenceLongitude,
              }}
              title={geofence.name || "Geofence"}
              description={
                member
                  ? `${member.role === "hunter" ? "🎯 Hunter" : "🏃 Adventurer"} ${member.user_name || geofence.attached_member_name || "Unknown"} • ${geofence.radius || 100}m`
                  : `Radius: ${geofence.radius || 100}m`
              }
              onPress={() => onGeofencePress && onGeofencePress(geofence)}
            >
              <Animated.View
                style={{
                  transform: isMyGeofence ? [{ scale: pulseAnim }] : [],
                }}
              >
                <View
                  style={{
                    backgroundColor: isHunterGeofence
                      ? "#EF4444"
                      : member
                        ? "#F59E0B"
                        : colors?.primary || "#3B82F6",
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <MapPin size={20} color="#fff" />
                </View>

                {/* Live GPS tracking indicator badge */}
                {isMyGeofence && currentLocation && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: "#10B981",
                      borderRadius: 10,
                      padding: 3,
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  >
                    <Radio size={10} color="#fff" fill="#fff" />
                  </View>
                )}
              </Animated.View>
            </Marker>
          );
        })}

      {/* Member markers */}
      {safeMembers.length > 0 &&
        safeMembers
          .filter((m) => m?.latitude && m?.longitude)
          .map((member) => {
            // CRITICAL: Use live GPS location if this is the current member
            const isCurrentMember = member.id === currentMemberId;
            let memberLatitude, memberLongitude;

            if (isCurrentMember && currentLocation) {
              // Use LIVE GPS location for current member
              memberLatitude = currentLocation.latitude;
              memberLongitude = currentLocation.longitude;
              console.log(
                `🟢 GREEN MARKER: Using LIVE GPS for member ${member.id}:`,
                {
                  lat: memberLatitude.toFixed(6),
                  lng: memberLongitude.toFixed(6),
                },
              );
            } else {
              // For other members, use their last known location from API
              memberLatitude = member.latitude;
              memberLongitude = member.longitude;
            }

            return (
              <Marker
                key={`member-${member.id}`}
                coordinate={{
                  latitude: memberLatitude,
                  longitude: memberLongitude,
                }}
                title={member.user_name || "Member"}
                description={calculateMemberStatus(member, safeGeofences)}
              >
                <Animated.View
                  style={{
                    transform: isCurrentMember ? [{ scale: pulseAnim }] : [],
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#10B981",
                      padding: 8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  >
                    <UsersIcon size={20} color="#fff" />
                  </View>

                  {/* Live GPS tracking indicator for current member */}
                  {isCurrentMember && currentLocation && (
                    <View
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        backgroundColor: "#10B981",
                        borderRadius: 10,
                        padding: 3,
                        borderWidth: 2,
                        borderColor: "#fff",
                      }}
                    >
                      <Radio size={10} color="#fff" fill="#fff" />
                    </View>
                  )}
                </Animated.View>
              </Marker>
            );
          })}

      {/* New geofence preview circle - only when placing */}
      {geofenceLocation && (
        <>
          <Circle
            center={geofenceLocation}
            radius={100}
            fillColor="rgba(34, 197, 94, 0.2)"
            strokeColor="rgba(34, 197, 94, 0.8)"
            strokeWidth={2}
          />
          <Marker coordinate={geofenceLocation}>
            <View
              style={{
                backgroundColor: "#22C55E",
                padding: 8,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <MapPin size={20} color="#fff" />
            </View>
          </Marker>
        </>
      )}
    </MapView>
  );
}
