import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { LogOut } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTheme } from "../../utils/theme";
import { useAuth } from "../../utils/auth/useAuth";

export function SignOutButton() {
  const { colors } = useAppTheme();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all cached queries first
            queryClient.clear();

            // Then sign out
            await signOut();
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert(
              "Error",
              "There was a problem signing out. Please try again.",
            );
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#EF4444",
      }}
      onPress={handleSignOut}
    >
      <LogOut size={20} color="#EF4444" style={{ marginRight: 8 }} />
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Montserrat_600SemiBold",
          color: "#EF4444",
        }}
      >
        Sign Out
      </Text>
    </TouchableOpacity>
  );
}
