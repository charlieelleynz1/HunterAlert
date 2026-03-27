import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Users as UsersIcon } from "lucide-react-native";

export function MemberIdentityButton({ currentMember, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: currentMember ? "#10B981" : "#F59E0B",
        padding: 6,
        borderRadius: 4,
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UsersIcon size={8} color="#fff" style={{ marginRight: 4 }} />
      <Text
        style={{
          color: "#fff",
          fontSize: 11,
          fontFamily: "Montserrat_600SemiBold",
        }}
      >
        {currentMember
          ? `Sharing as ${currentMember.user_name}`
          : "Tap to select your identity"}
      </Text>
    </TouchableOpacity>
  );
}
