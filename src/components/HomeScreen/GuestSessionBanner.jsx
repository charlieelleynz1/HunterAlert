import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export function GuestSessionBanner({
  guestSessionCount,
  guestLimitReached,
  insets,
  onSignUp,
}) {
  if (guestSessionCount === 0) return null;

  return (
    <View
      style={{
        backgroundColor: guestLimitReached
          ? "#DC2626"
          : guestSessionCount === 2
            ? "#F59E0B"
            : "#3B82F6",
        paddingVertical: 12,
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 14,
          fontFamily: "Montserrat_600SemiBold",
          textAlign: "center",
        }}
      >
        {guestLimitReached
          ? "🚫 Free trial complete - Sign up to continue"
          : `⚠️ Guest Session ${guestSessionCount}/3 - Sign up for unlimited use`}
      </Text>
      {!guestLimitReached && (
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 8,
            paddingVertical: 6,
            paddingHorizontal: 12,
            marginTop: 8,
            alignSelf: "center",
          }}
          onPress={onSignUp}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontFamily: "Montserrat_600SemiBold",
            }}
          >
            Create Free Account
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
