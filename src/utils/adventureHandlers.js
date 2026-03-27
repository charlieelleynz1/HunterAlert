import { Alert } from "react-native";
import * as Location from "expo-location";

export async function handleActiveSessionConflict(
  errorData,
  deviceId,
  queryClient,
  router,
  handleConfirmStartAdventure,
  endTime,
) {
  const isThisDevice = errorData.existingMember.device_id === deviceId;

  // If it's the same device, automatically resume the existing adventure
  if (isThisDevice) {
    console.log("✅ Same device detected - auto-resuming existing adventure");
    router.push({
      pathname: "/(tabs)/tracking",
      params: { memberId: errorData.existingMember.id },
    });
    return;
  }

  // Only show dialog if it's a different device
  const deviceInfo = "on another device";

  Alert.alert(
    "Active Adventure Found",
    `You already have an adventure running ${deviceInfo} as "${errorData.existingMember.user_name}" (${errorData.existingMember.role}).\n\nWhat would you like to do?`,
    [
      {
        text: "Resume Existing",
        onPress: () => {
          // Navigate to the existing adventure
          router.push({
            pathname: "/(tabs)/tracking",
            params: { memberId: errorData.existingMember.id },
          });
        },
      },
      {
        text: "End & Start New",
        style: "destructive",
        onPress: async () => {
          // Delete the old adventure and start fresh using end-adventure endpoint
          try {
            const deleteResponse = await fetch(
              `/api/members/${errorData.existingMember.id}/end-adventure?deviceId=${deviceId}`,
              { method: "POST" },
            );

            if (!deleteResponse.ok) {
              const deleteError = await deleteResponse.json();
              console.error("❌ Delete failed:", deleteError);
              throw new Error(
                deleteError.error || "Failed to end existing adventure",
              );
            }

            // Invalidate cache
            await queryClient.invalidateQueries({
              queryKey: ["members"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["geofences"],
            });

            // Small delay then retry creation
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Retry the adventure creation
            handleConfirmStartAdventure(endTime);
          } catch (error) {
            console.error("Failed to end existing adventure:", error);
            Alert.alert(
              "Error",
              "Could not end the existing adventure. Please use the End Adventure button in the tracking screen.",
            );
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
  );
}

export async function createOrReuseMember(
  existingMember,
  endTime,
  selectedRole,
  profileData,
  user,
  deviceId,
  refetchMembers,
) {
  // Always create new member - no reuse since members are deleted on end
  console.log("🎯 Creating new member with role:", selectedRole);

  const userName =
    profileData?.user?.name ||
    profileData?.user?.email ||
    user?.email ||
    (selectedRole === "hunter" ? "Hunter" : "Adventurer");

  const memberResponse = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      role: selectedRole,
      deviceId,
    }),
  });

  if (!memberResponse.ok) {
    const errorData = await memberResponse.json();

    // Return error data for handling in the calling function
    if (
      memberResponse.status === 409 &&
      errorData.error === "ACTIVE_SESSION_EXISTS"
    ) {
      throw { status: 409, data: errorData };
    }

    throw new Error(
      errorData.message || errorData.error || "Failed to create member",
    );
  }

  const responseData = await memberResponse.json();
  const member = responseData.member;

  // Set expected end time
  if (endTime) {
    await fetch(`/api/members/${member.id}/expected-end-time`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expected_end_time: endTime.toISOString() }),
    });
  }

  return member;
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission Required",
      "Location access is needed for adventure mode",
    );
    return false;
  }
  return true;
}

export function showBatterySavingTip() {
  setTimeout(() => {
    Alert.alert(
      "🔋 Battery Tip",
      "Your adventure is tracking! You can safely lock your phone to save battery - location tracking continues in the background.",
      [{ text: "Got it!", style: "default" }],
    );
  }, 2000);
}

export function showGuestSessionWarning(newCount, router) {
  if (newCount === 2) {
    setTimeout(() => {
      Alert.alert(
        "⚠️ 1 Free Session Remaining",
        "You have 1 free session left. Sign up to unlock unlimited adventures!",
        [
          {
            text: "Create Account",
            onPress: () => router.push("/auth/email-signup"),
          },
          { text: "Continue", style: "cancel" },
        ],
      );
    }, 3000);
  }
}
