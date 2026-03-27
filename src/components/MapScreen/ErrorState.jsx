import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AlertCircle } from "lucide-react-native";

export function ErrorState({ colors, error, onRetry, isRetrying }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#FEE2E2",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <AlertCircle size={40} color="#DC2626" />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Unable to Load Map
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          {error?.message || "Please check your connection and try again"}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.blue,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
          }}
          onPress={onRetry}
          disabled={isRetrying}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            {isRetrying ? "Retrying..." : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
