import React from "react";
import { View, Text } from "react-native";

export function ModeIndicator({ geofenceMode, insets }) {
  if (!geofenceMode) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 200,
        left: 20,
        right: 20,
        backgroundColor: geofenceMode === "add" ? "#3B82F6" : "#EF4444",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Montserrat_600SemiBold",
          color: "#FFFFFF",
        }}
      >
        {geofenceMode === "add"
          ? "🗺️ TAP MAP TO ADD GEOFENCE"
          : "🗑️ TAP YOUR GEOFENCES TO DELETE"}
      </Text>
    </View>
  );
}
