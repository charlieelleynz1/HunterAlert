import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WifiOff, RefreshCw } from "lucide-react-native";

export function NetworkErrorIndicator({ onRetry, isRefetching }) {
  return (
    <View
      style={{
        backgroundColor: "#FEE2E2",
        padding: 12,
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <WifiOff size={20} color="#DC2626" />
        <Text
          style={{ marginLeft: 8, color: "#DC2626", flex: 1, fontSize: 12 }}
        >
          Unable to load invite codes
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRetry}
        disabled={isRefetching}
        style={{
          backgroundColor: "#DC2626",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <RefreshCw size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
