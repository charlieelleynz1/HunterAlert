import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { Plus } from "lucide-react-native";

export function AddGeofenceButton({ onPress, colors }) {
  const handlePress = () => {
    Alert.alert(
      "Add Geofence",
      "Tap anywhere on the map to place a geofence marker",
      [{ text: "OK" }],
    );
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Plus size={28} color="#fff" />
    </TouchableOpacity>
  );
}
