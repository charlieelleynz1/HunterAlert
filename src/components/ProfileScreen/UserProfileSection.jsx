import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { User } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppTheme } from "../../utils/theme";
import useUser from "../../utils/auth/useUser";

export function UserProfileSection() {
  const { colors } = useAppTheme();
  const { user, loading: authLoading } = useUser();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // Fetch current profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (name) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditingName(false);
      Alert.alert("Success", "Your name has been updated!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update your name. Please try again.");
    },
  });

  const userName = profileData?.user?.name || "";

  useEffect(() => {
    setEditedName(userName);
  }, [userName]);

  const handleSaveName = async () => {
    if (editedName.trim()) {
      updateProfileMutation.mutate(editedName.trim());
    }
  };

  if (authLoading || profileLoading) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <ActivityIndicator size="small" color={colors.blue} />
      </View>
    );
  }

  return (
    <>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Montserrat_600SemiBold",
          color: colors.primary,
          marginBottom: 12,
        }}
      >
        Your Profile
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.blue + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <User size={28} color={colors.blue} />
          </View>

          <View style={{ flex: 1 }}>
            {isEditingName ? (
              <TextInput
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
                placeholder="Enter your name"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                }}
              >
                {userName || "Set your name"}
              </Text>
            )}
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                marginTop: 2,
              }}
            >
              This name appears to all group members
            </Text>
          </View>
        </View>

        {isEditingName ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
              }}
              onPress={() => {
                setIsEditingName(false);
                setEditedName(userName);
              }}
              disabled={updateProfileMutation.isPending}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.secondary,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.blue,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                opacity: updateProfileMutation.isPending ? 0.6 : 1,
              }}
              onPress={handleSaveName}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: colors.blueLight,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
            }}
            onPress={() => setIsEditingName(true)}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.blue,
              }}
            >
              Edit Name
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
