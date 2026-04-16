import React from "react";
import { View, Text } from "react-native";
import { Radio } from "lucide-react-native";

export function SyncIndicator({
  shouldShowSync,
  activeTrackers,
  totalMembers,
  insets,
}) {
  if (!shouldShowSync) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 10,
        right: 10,
        backgroundColor: "#22c55e",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        zIndex: 11,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Radio size={12} color="#fff" />
      <Text
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Montserrat_600SemiBold",
        }}
      >
        SYNC {activeTrackers}/{totalMembers}
      </Text>
    </View>
  );
}
