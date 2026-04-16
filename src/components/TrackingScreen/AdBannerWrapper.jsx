import React from "react";
import { View } from "react-native";
import AdBanner from "@/components/AdBanner";

export function AdBannerWrapper({
  insets,
  hasNetworkIssues,
  currentMemberId,
  currentLocation,
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + (currentMemberId && currentLocation ? 60 : 10),
        left: 20,
        right: 20,
        zIndex: 8,
      }}
    >
      <AdBanner />
    </View>
  );
}
