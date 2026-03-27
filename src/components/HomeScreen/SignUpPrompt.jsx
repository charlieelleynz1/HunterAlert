import React from "react";
import { TouchableOpacity, Text } from "react-native";

export function SignUpPrompt({ guestLimitReached, onPress }) {
  if (!guestLimitReached) return null;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#10B981",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 20,
          fontFamily: "Montserrat_700Bold",
          color: "#FFFFFF",
        }}
      >
        Create Free Account
      </Text>
    </TouchableOpacity>
  );
}
