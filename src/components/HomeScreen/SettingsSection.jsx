import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { User, ChevronRight, Phone } from "lucide-react-native";

export function SettingsSection({ contactCount, colors, onProfilePress }) {
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
        Settings
      </Text>

      <View style={{ gap: 12 }}>
        {/* View Profile */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
          onPress={onProfilePress}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: colors.surfaceVariant,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <User size={28} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 4,
              }}
            >
              My Profile
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 18,
              }}
            >
              Manage settings and emergency contacts
            </Text>
          </View>
          <ChevronRight size={24} color={colors.secondary} />
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
          onPress={onProfilePress}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: colors.redLight,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Phone size={28} color={colors.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 4,
              }}
            >
              Emergency Contacts
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 18,
              }}
            >
              {contactCount} contact{contactCount !== 1 ? "s" : ""} saved
            </Text>
          </View>
          <ChevronRight size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>
    </>
  );
}
