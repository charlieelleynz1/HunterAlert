import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";

export function AudioStatusIndicator({
  currentMemberId,
  audioStatus,
  sirenPlayer,
  beepPlayer,
  insets,
  hasNetworkIssues,
  currentLocation,
}) {
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss the banner 3 seconds after audio becomes ready
  useEffect(() => {
    if (audioStatus === "ready") {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // Reset if audio goes back to loading (e.g. reinit)
      setDismissed(false);
    }
  }, [audioStatus]);

  // Don't show if no active member, or if already dismissed after ready
  if (!currentMemberId) return null;
  if (dismissed) return null;

  // Don't show when audio is ready (will auto-dismiss shortly via the effect above,
  // but skip rendering the green banner entirely for a cleaner look)
  if (audioStatus === "ready") return null;

  const sirenLoaded = sirenPlayer?.isLoaded || false;
  const alarmLoaded = beepPlayer?.isLoaded || false;

  const getStatusColor = () => {
    if (audioStatus === "partial") return "rgba(251, 191, 36, 0.9)";
    if (audioStatus === "loading") return "rgba(251, 146, 60, 0.9)";
    if (audioStatus === "failed") return "rgba(239, 68, 68, 0.9)";
    return "rgba(156, 163, 175, 0.9)";
  };

  const getStatusText = () => {
    if (audioStatus === "partial") {
      return `⏳ Loading... • ${sirenLoaded ? "Siren ✓" : "Siren ⏳"}${alarmLoaded ? " Alarm ✓" : " Alarm ⏳"}`;
    }
    if (audioStatus === "loading") return "⏳ Loading Audio System...";
    if (audioStatus === "failed") return "⚠️ Audio Failed - Vibration Only";
    return "🔇 Audio Not Started";
  };

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + (currentLocation ? 55 : 10),
        left: 20,
        right: 20,
        backgroundColor: getStatusColor(),
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        zIndex: 8,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Montserrat_600SemiBold",
          color: "#FFFFFF",
        }}
      >
        {getStatusText()}
      </Text>
    </View>
  );
}
