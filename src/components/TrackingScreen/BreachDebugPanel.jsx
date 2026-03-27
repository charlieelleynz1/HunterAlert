import React from "react";
import { View, Text } from "react-native";

export function BreachDebugPanel({
  currentMemberId,
  geofenceStatus,
  intruderStatus,
  isFocused,
  insets,
}) {
  if (
    !currentMemberId ||
    (!geofenceStatus?.isInside && !intruderStatus?.hasIntruders)
  ) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 90,
        left: 20,
        right: 20,
        backgroundColor: "rgba(239, 68, 68, 0.95)",
        borderRadius: 12,
        padding: 16,
        zIndex: 10,
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Montserrat_600SemiBold",
          color: "#FFFFFF",
          marginBottom: 8,
        }}
      >
        🚨 DEBUG: BREACH DETECTED
      </Text>

      {geofenceStatus?.isInside && (
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
            }}
          >
            ✓ You entered a zone: {geofenceStatus.count} zone(s)
          </Text>
          <Text style={{ color: "#FEE2E2", fontSize: 11 }}>
            isFocused: {isFocused ? "YES" : "NO"}
          </Text>
        </View>
      )}

      {intruderStatus?.hasIntruders && (
        <View>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
            }}
          >
            ✓ Intruders in your zone: {intruderStatus.count}
          </Text>
          <Text style={{ color: "#FEE2E2", fontSize: 11 }}>
            isFocused: {isFocused ? "YES" : "NO"}
          </Text>
        </View>
      )}

      <Text style={{ color: "#FEF3C7", fontSize: 10, marginTop: 8 }}>
        If no alarm sounds, check phone isn't on silent mode
      </Text>
    </View>
  );
}
