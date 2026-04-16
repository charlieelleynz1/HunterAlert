import React from "react";
import { View, Text, Animated } from "react-native";
import { Navigation } from "lucide-react-native";

export function LocationTrackingIndicator({
  currentMemberId,
  currentLocation,
  isTrackingActive,
  secondsAgo,
  pulseAnim,
  insets,
  hasNetworkIssues,
}) {
  if (!currentMemberId || !currentLocation) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 20,
        backgroundColor: isTrackingActive
          ? "rgba(16, 185, 129, 0.95)"
          : "rgba(245, 158, 11, 0.95)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        zIndex: 9,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Animated.View
        style={{
          transform: isTrackingActive ? [{ scale: pulseAnim }] : [],
          marginRight: 8,
        }}
      >
        <Navigation size={16} color="#FFFFFF" fill="#FFFFFF" />
      </Animated.View>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Montserrat_600SemiBold",
          color: "#FFFFFF",
        }}
      >
        {isTrackingActive
          ? `Tracking • ${secondsAgo}s ago`
          : "Idle - Battery saving"}
      </Text>
    </View>
  );
}
