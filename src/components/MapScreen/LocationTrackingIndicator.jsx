import React from "react";
import { View, Text } from "react-native";
import { Navigation, Pause, UserX } from "lucide-react-native";

export const LocationTrackingIndicator = ({
  isTracking,
  isFocused,
  selectedMemberId,
  colors,
}) => {
  // Don't show if no member is selected
  if (!selectedMemberId) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 6,
          paddingVertical: 5,
          paddingHorizontal: 7,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 5,
          }}
        >
          <UserX size={8} color="#9CA3AF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.secondary,
            }}
          >
            Not Tracking
          </Text>
          <Text
            style={{
              fontSize: 9,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 0.5,
            }}
          >
            Select a member to start
          </Text>
        </View>
      </View>
    );
  }

  // Show paused state if not focused
  if (!isFocused) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 6,
          paddingVertical: 5,
          paddingHorizontal: 7,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#FEF3C7",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 5,
          }}
        >
          <Pause size={8} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Montserrat_600SemiBold",
              color: "#F59E0B",
            }}
          >
            Tracking Paused
          </Text>
          <Text
            style={{
              fontSize: 9,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 0.5,
            }}
          >
            On different screen
          </Text>
        </View>
      </View>
    );
  }

  // Show active tracking state
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 7,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: "#D1FAE5",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 5,
        }}
      >
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#10B981",
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Montserrat_600SemiBold",
          color: "#10B981",
          marginRight: 6,
        }}
      >
        Tracking Active
      </Text>
      <Text
        style={{
          fontSize: 9,
          fontFamily: "Montserrat_500Medium",
          color: colors.secondary,
          marginRight: 6,
        }}
      >
        • Location updating
      </Text>
      {/* Pulsing animation indicator */}
      <View style={{ position: "relative" }}>
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: "#10B981",
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: "#10B981",
            opacity: 0.4,
          }}
        />
      </View>
    </View>
  );
};
