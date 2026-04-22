import React, { useState } from "react";
import { View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import { ExpectedEndTimeModal } from "@/components/ExpectedEndTimeModal";
import useUser from "@/utils/auth/useUser";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { storage } from "@/utils/storage";
import { useHomeScreenData } from "@/hooks/useHomeScreenData";
import { useGuestSession } from "@/hooks/useGuestSession";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { GuestSessionBanner } from "@/components/HomeScreen/GuestSessionBanner";
import { HomeHeader } from "@/components/HomeScreen/HomeHeader";
import { RoleSelector } from "@/components/HomeScreen/RoleSelector";
import { StartAdventureButton } from "@/components/HomeScreen/StartAdventureButton";
import { SignUpPrompt } from "@/components/HomeScreen/SignUpPrompt";
import { SettingsSection } from "@/components/HomeScreen/SettingsSection";
import {
  handleActiveSessionConflict,
  createOrReuseMember,
  requestLocationPermission,
  showBatterySavingTip,
  showGuestSessionWarning,
} from "@/utils/adventureHandlers";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { data: user } = useUser();
  const { auth, signOut } = useAuth();
  const { deviceId } = useDeviceIdentity();
  const queryClient = useQueryClient();
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("adventurer");

  // Initialize audio on home screen so it's ready before adventure starts
  const { audioReady } = useAlarmAudio();

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const isGuest = !auth?.jwt;

  const {
    profile,
    profileLoading,
    contactCount,
    activeMembers,
    refetchMembers,
  } = useHomeScreenData(isGuest);

  const { guestSessionCount, guestLimitReached, incrementSession, checkLimit } =
    useGuestSession(isGuest);

  const handleForceRefresh = async () => {
    console.log("🔄 FORCE REFRESH: Reloading data from server");
    await queryClient.resetQueries({ queryKey: ["members"] });
    await refetchMembers();
    console.log("✅ FORCE REFRESH: Complete");
    Alert.alert("Refreshed", "Data reloaded from server");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            if (isGuest) {
              await storage.removeItem("guestMode");
              router.replace("/auth/launch");
            } else {
              await signOut();
            }
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleStartAdventure = async () => {
    console.log("🎯 START: User tapped Start Adventure button");

    // Audio check is now informational — vibration always works as fallback
    if (!audioReady) {
      console.warn(
        "⚠️ START: Audio not fully loaded, proceeding anyway (vibration fallback)",
      );
    }

    // Check guest limit BEFORE starting
    if (isGuest) {
      const limitReached = await checkLimit();
      if (limitReached) {
        Alert.alert(
          "Free Trial Limit Reached",
          "You've used all 3 free sessions. Sign up now to continue using Hunter Safe!",
          [
            {
              text: "Create Account",
              onPress: () => router.push("/auth/email-signup"),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
        return;
      }
    }

    setIsStarting(true);

    // Clear cached data before starting
    console.log("🧹 START: Clearing stale cache...");
    await queryClient.removeQueries({ queryKey: ["members"] });
    await queryClient.removeQueries({ queryKey: ["geofences"] });
    await storage.removeItem("cached_members_all");
    await storage.removeItem("cached_geofences_all");

    console.log("✅ START: Ready to start new adventure");

    // Proceed to create new adventure
    setIsStarting(false);
    setShowEndTimeModal(true);
  };

  const handleConfirmStartAdventure = async (endTime) => {
    setIsStarting(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setShowEndTimeModal(false);
        setIsStarting(false);
        return;
      }

      let member;

      try {
        member = await createOrReuseMember(
          null, // No reuse - always create new
          endTime,
          selectedRole,
          profile,
          user,
          deviceId,
          refetchMembers,
        );
      } catch (error) {
        if (error.status === 409 && error.data) {
          setShowEndTimeModal(false);
          setIsStarting(false);
          await handleActiveSessionConflict(
            error.data,
            deviceId,
            queryClient,
            router,
            handleConfirmStartAdventure,
            endTime,
          );
          return;
        }
        throw error;
      }

      // Increment guest session count AFTER successful creation
      if (isGuest) {
        const newCount = await incrementSession();
        showGuestSessionWarning(newCount, router);
      }

      console.log(
        "✅ Member ready:",
        member.id,
        "- Refreshing cache before navigation...",
      );

      // CRITICAL: Invalidate and wait for fresh member data before navigating
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await refetchMembers();

      // Small delay to ensure state is stable
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log("✅ Cache refreshed - navigating to tracking screen");

      setShowEndTimeModal(false);
      setIsStarting(false);

      showBatterySavingTip();

      router.push({
        pathname: "/(tabs)/tracking",
        params: { memberId: member.id },
      });
    } catch (error) {
      console.error("Failed to start adventure:", error);
      Alert.alert("Error", error.message || "Failed to start adventure mode");
      setIsStarting(false);
    }
  };

  if (!fontsLoaded || profileLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <GuestSessionBanner
        guestSessionCount={guestSessionCount}
        guestLimitReached={guestLimitReached}
        insets={insets}
        onSignUp={() => router.push("/auth/email-signup")}
      />

      <HomeHeader
        isGuest={isGuest}
        profile={profile}
        contactCount={contactCount}
        colors={colors}
        insets={insets}
        guestSessionCount={guestSessionCount}
        onRefresh={handleForceRefresh}
        onSignOut={handleSignOut}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          colors={colors}
        />

        <StartAdventureButton
          selectedRole={selectedRole}
          isStarting={isStarting}
          guestLimitReached={guestLimitReached}
          audioReady={audioReady}
          colors={colors}
          onPress={handleStartAdventure}
        />

        <SignUpPrompt
          guestLimitReached={guestLimitReached}
          onPress={() => router.push("/auth/email-signup")}
        />

        <SettingsSection
          contactCount={contactCount}
          colors={colors}
          onProfilePress={() => router.push("/(tabs)/profile")}
        />
      </ScrollView>

      <ExpectedEndTimeModal
        visible={showEndTimeModal}
        onClose={() => {
          setShowEndTimeModal(false);
          setIsStarting(false);
        }}
        onConfirm={handleConfirmStartAdventure}
        colors={colors}
      />
    </View>
  );
}
