import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { WifiOff, Signal, FlaskConical } from "lucide-react-native";

export function NetworkStatusBanner({
  isOnline,
  networkQuality,
  testMode,
  shouldShowSync,
  insets,
  refreshNetworkStatus,
  toggleTestMode,
}) {
  if (isOnline && networkQuality === "good" && !testMode) return null;

  const isOffline = !isOnline;
  const bgColor = isOffline
    ? "rgba(245, 158, 11, 0.9)"
    : testMode
      ? "rgba(139, 92, 246, 0.9)"
      : "rgba(251, 191, 36, 0.85)";

  const textColor = isOffline || testMode ? "#FFFFFF" : "#92400E";

  const label = testMode
    ? "🧪 Test Mode"
    : isOffline
      ? "Offline"
      : networkQuality === "poor"
        ? "Weak Signal"
        : "Slow Connection";

  return (
    <TouchableOpacity
      onPress={refreshNetworkStatus}
      onLongPress={() => {
        Alert.alert(
          "Test Mode",
          testMode ? "Disable test mode?" : "Enable offline test mode?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: testMode ? "Disable" : "Enable",
              onPress: () => toggleTestMode(!isOnline),
            },
          ],
        );
      }}
      activeOpacity={0.8}
      style={{
        position: "absolute",
        bottom: insets.bottom + 76,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 5,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        {isOffline ? (
          <WifiOff size={13} color={textColor} />
        ) : testMode ? (
          <FlaskConical size={13} color={textColor} />
        ) : (
          <Signal size={13} color={textColor} />
        )}
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Montserrat_600SemiBold",
            color: textColor,
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
