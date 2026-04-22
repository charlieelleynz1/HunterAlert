import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { RefreshCw, LogOut, Activity, Phone } from "lucide-react-native";

export function HomeHeader({
  isGuest,
  profile,
  contactCount,
  colors,
  insets,
  guestSessionCount,
  onRefresh,
  onSignOut,
}) {
  return (
    <View
      style={{
        paddingTop: (isGuest && guestSessionCount > 0 ? 0 : insets.top) + 20,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginBottom: 4,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
            }}
          >
            {isGuest ? "Guest" : profile?.name || profile?.email || "User"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Refresh Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.surfaceVariant,
              borderRadius: 12,
              padding: 10,
            }}
            onPress={onRefresh}
          >
            <RefreshCw size={20} color={colors.blue} />
          </TouchableOpacity>
          {/* Sign Out */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.surfaceVariant,
              borderRadius: 12,
              padding: 10,
            }}
            onPress={onSignOut}
          >
            <LogOut size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Stats */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.blueLight,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Activity size={24} color={colors.blue} style={{ marginBottom: 8 }} />
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Montserrat_700Bold",
              color: colors.blue,
            }}
          >
            Ready
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 2,
            }}
          >
            Start Tracking
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.greenLight,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Phone size={24} color={colors.green} style={{ marginBottom: 8 }} />
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Montserrat_700Bold",
              color: colors.green,
            }}
          >
            {contactCount}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 2,
            }}
          >
            Emergency Contacts
          </Text>
        </View>
      </View>
    </View>
  );
}
