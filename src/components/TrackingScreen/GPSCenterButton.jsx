import React from "react";
import { TouchableOpacity } from "react-native";
import { Navigation } from "lucide-react-native";

export function GPSCenterButton({
  currentLocation,
  mapRef,
  colors,
  insets,
  hasNetworkIssues,
  currentMemberId,
  shouldShowSync,
}) {
  if (!currentLocation) return null;

  const handlePress = () => {
    if (mapRef?.current && currentLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        500,
      );
    }
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: insets.top + (currentMemberId ? 15 : -35),
        right: shouldShowSync ? 130 : 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        zIndex: 9,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
      onPress={handlePress}
    >
      <Navigation size={24} color={colors.blue} fill={colors.blue} />
    </TouchableOpacity>
  );
}
