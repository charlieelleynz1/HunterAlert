import React from "react";
import { View, Text } from "react-native";
import { Satellite, WifiOff, Signal, SignalLow } from "lucide-react-native";

export function NetworkStatusIndicator({
  isOnline,
  queuedUpdates,
  networkQuality,
}) {
  // Determine icon and message based on network quality
  const getNetworkDisplay = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff size={16} color="#DC2626" />,
        message: "Offline - Using cached data",
        bgColor: "#FEE2E2",
        textColor: "#DC2626",
        borderColor: "#DC2626",
      };
    }

    switch (networkQuality) {
      case "good":
        return {
          icon: <Signal size={16} color="#10B981" />,
          message: "Connected - Good signal",
          bgColor: "#F0FDF4",
          textColor: "#166534",
          borderColor: "#10B981",
        };
      case "fair":
        return {
          icon: <Satellite size={16} color="#F59E0B" />,
          message: "Connected - Satellite/3G",
          bgColor: "#FFFBEB",
          textColor: "#92400E",
          borderColor: "#F59E0B",
        };
      case "poor":
        return {
          icon: <SignalLow size={16} color="#F59E0B" />,
          message: "Connected - Slow network",
          bgColor: "#FFFBEB",
          textColor: "#92400E",
          borderColor: "#F59E0B",
        };
      default:
        return {
          icon: <Satellite size={16} color="#10B981" />,
          message: "Checking connection...",
          bgColor: "#F0FDF4",
          textColor: "#166534",
          borderColor: "#10B981",
        };
    }
  };

  const display = getNetworkDisplay();

  return (
    <View
      style={{
        backgroundColor: display.bgColor,
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: display.borderColor,
      }}
    >
      {display.icon}
      <Text
        style={{
          marginLeft: 8,
          color: display.textColor,
          flex: 1,
          fontSize: 11,
          fontFamily: "Montserrat_500Medium",
        }}
      >
        {display.message}
      </Text>
      {!isOnline && queuedUpdates > 0 && (
        <View
          style={{
            backgroundColor: "#F59E0B",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "#fff",
              fontFamily: "Montserrat_600SemiBold",
            }}
          >
            {queuedUpdates} queued
          </Text>
        </View>
      )}
    </View>
  );
}
