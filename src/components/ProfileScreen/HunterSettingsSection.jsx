import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Target } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function HunterSettingsSection({ member }) {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const [radius, setRadius] = useState(
    (member?.default_geofence_radius || 150).toString(),
  );

  const updateRadiusMutation = useMutation({
    mutationFn: async (newRadius) => {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_geofence_radius: newRadius }),
      });
      if (!response.ok) throw new Error("Failed to update radius");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      Alert.alert("Success", "Default geofence radius updated!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update radius. Please try again.");
      console.error(error);
    },
  });

  const handleSave = () => {
    const newRadius = parseFloat(radius);
    if (isNaN(newRadius) || newRadius < 150) {
      Alert.alert("Error", "Radius must be at least 150 meters");
      return;
    }
    updateRadiusMutation.mutate(newRadius);
  };

  if (!member || member.role !== "hunter") {
    return null;
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Target size={20} color={colors.primary} />
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.text,
            marginLeft: 8,
          }}
        >
          Hunter Settings
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat_500Medium",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Personal Geofence Radius
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.secondary,
            marginBottom: 12,
          }}
        >
          Your automatic geofence will be this size and follow you when you
          start hunting. Minimum 150m.
        </Text>

        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <TextInput
            value={radius}
            onChangeText={setRadius}
            placeholder="150"
            keyboardType="numeric"
            style={{
              flex: 1,
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 8,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            editable={!updateRadiusMutation.isPending}
          />
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateRadiusMutation.isPending}
            style={{
              backgroundColor: updateRadiusMutation.isPending
                ? colors.border
                : colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
              }}
            >
              {updateRadiusMutation.isPending ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
