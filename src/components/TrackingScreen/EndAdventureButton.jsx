import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { storage } from "@/utils/storage";

export function EndAdventureButton({ currentMemberId, insets }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { deviceId } = useDeviceIdentity();

  if (!currentMemberId) return null;

  const handleEndAdventure = async () => {
    Alert.alert(
      "End Adventure?",
      "This will stop tracking, clear all data, and sign you out. Your account and membership will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Adventure",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🏁 Ending adventure for member:", currentMemberId);

              // Call end-adventure endpoint to clear member data and geofences
              const response = await fetch(
                `/api/members/${currentMemberId}/end-adventure?deviceId=${deviceId}`,
                { method: "POST" },
              );

              if (!response.ok && response.status !== 404) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to end adventure");
              }

              const result =
                response.status === 404
                  ? { geofencesDeleted: 0 }
                  : await response.json();
              console.log("✅ Adventure ended:", result);

              // Clear ALL local storage for complete reset
              await storage.removeItem(`geofence_id_${currentMemberId}`);
              await storage.removeItem(`member_identity_${deviceId}`);
              await storage.removeItem("cached_geofences_all");
              await storage.removeItem("cached_members_all");
              await storage.removeItem("guestMode");

              // Clear query cache
              await queryClient.clear();

              console.log("🏁 Signing out and redirecting to welcome page...");

              // Sign out and navigate to welcome screen
              await signOut();

              // Navigate to the attractive welcome page
              router.replace("/welcome");

              // Show success toast after navigation
              setTimeout(() => {
                Alert.alert(
                  "✅ Adventure Ended",
                  `${result.geofencesDeleted || 0} geofence(s) cleared. Your account is safe!`,
                );
              }, 500);
            } catch (error) {
              console.error("❌ Error ending adventure:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to end adventure. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: insets.bottom + 20,
        left: 20,
        right: 20,
        backgroundColor: "#DC2626",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={handleEndAdventure}
    >
      <XCircle size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 16,
          fontFamily: "Montserrat_600SemiBold",
        }}
      >
        End Adventure
      </Text>
    </TouchableOpacity>
  );
}
