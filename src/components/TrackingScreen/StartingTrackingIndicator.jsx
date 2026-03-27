import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export function StartingTrackingIndicator({
  currentMemberId,
  currentLocation,
  insets,
  hasNetworkIssues,
}) {
  if (!currentMemberId || currentLocation) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 20,
        right: 20,
        backgroundColor: "rgba(59, 130, 246, 0.95)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
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
      <ActivityIndicator
        size="small"
        color="#FFFFFF"
        style={{ marginRight: 8 }}
      />
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Montserrat_600SemiBold",
          color: "#FFFFFF",
        }}
      >
        🎯 Starting location tracking...
      </Text>
    </View>
  );
}
