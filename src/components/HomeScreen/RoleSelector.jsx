import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Activity, Eye } from "lucide-react-native";

export function RoleSelector({ selectedRole, onRoleChange, colors }) {
  return (
    <>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Montserrat_700Bold",
          color: colors.primary,
          marginBottom: 16,
        }}
      >
        Choose Your Role
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
        {/* Adventurer Role */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor:
              selectedRole === "adventurer"
                ? colors.greenLight
                : colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor:
              selectedRole === "adventurer" ? colors.green : "transparent",
          }}
          onPress={() => onRoleChange("adventurer")}
        >
          <Activity
            size={24}
            color={
              selectedRole === "adventurer" ? colors.green : colors.secondary
            }
            style={{ marginBottom: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color:
                selectedRole === "adventurer" ? colors.green : colors.primary,
              marginBottom: 4,
            }}
          >
            Adventurer
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
            }}
          >
            Loud beep alert
          </Text>
        </TouchableOpacity>

        {/* Hunter Role */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor:
              selectedRole === "hunter" ? colors.blueLight : colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor:
              selectedRole === "hunter" ? colors.blue : "transparent",
          }}
          onPress={() => onRoleChange("hunter")}
        >
          <Eye
            size={24}
            color={selectedRole === "hunter" ? colors.blue : colors.secondary}
            style={{ marginBottom: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: selectedRole === "hunter" ? colors.blue : colors.primary,
              marginBottom: 4,
            }}
          >
            Hunter
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
            }}
          >
            Siren alert
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
