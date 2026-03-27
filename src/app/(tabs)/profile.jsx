import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, TouchableOpacity, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import {
  Wrench,
  Navigation,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Shield,
} from "lucide-react-native";
import Constants from "expo-constants";
import { useAppTheme } from "../../utils/theme";
import { storage, clearAllAppData } from "../../utils/storage";
import FixedHeader from "../../components/FixedHeader";
import { useProfileData } from "../../hooks/useProfileData";
import { useEmergencyContactMutations } from "../../hooks/useEmergencyContactMutations";
import { useLocationPermission } from "../../hooks/useLocationPermission";
import { UserProfileSection } from "../../components/ProfileScreen/UserProfileSection";
import { EmergencyContactsSection } from "../../components/ProfileScreen/EmergencyContactsSection";
import { PrivacyPermissionsSection } from "../../components/ProfileScreen/PrivacyPermissionsSection";
import { AboutSection } from "../../components/ProfileScreen/AboutSection";
import { AddContactModal } from "../../components/ProfileScreen/AddContactModal";
import { SignOutButton } from "../../components/ProfileScreen/SignOutButton";
import { SettingRow } from "../../components/ProfileScreen/SettingRow";
import AdBanner from "../../components/AdBanner";
import { useAuth } from "../../utils/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useMembership } from "../../utils/useMembership";
import * as SecureStore from "expo-secure-store";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const { status, needsRenewal, loading: membershipLoading } = useMembership();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
    preferredMethod: "sms",
  });
  const [resetting, setResetting] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  const [testingBreaches, setTestingBreaches] = useState(false);

  const isDev = Constants.expoConfig?.extra?.isDev !== false;

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem("notificationsEnabled");
      if (saved !== null) {
        setNotificationsEnabled(JSON.parse(saved));
      }
    })();
  }, []);

  // Check if PIN is enabled
  useEffect(() => {
    (async () => {
      try {
        const enabled = await SecureStore.getItemAsync("pin_enabled");
        setPinEnabled(enabled === "true");
      } catch (error) {
        console.error("Error checking PIN status:", error);
      } finally {
        setCheckingPin(false);
      }
    })();
  }, []);

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  const { data: membersResponse } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await fetch("/api/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    },
    refetchInterval: 5000,
  });

  const activeMembers = membersResponse?.members || [];
  const currentAdventure = activeMembers[0];

  const { contactsData, contactsError, refetchContacts, isRefetchingContacts } =
    useProfileData();

  const { addContactMutation, deleteContactMutation } =
    useEmergencyContactMutations();

  const { locationEnabled, toggleLocation } = useLocationPermission();

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    addContactMutation.mutate(newContact, {
      onSuccess: () => {
        setShowAddContactModal(false);
        setNewContact({
          name: "",
          phone: "",
          relationship: "",
          preferredMethod: "sms",
        });
        Alert.alert("Success", "Emergency contact added!");
      },
    });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(offsetY > 10);
  };

  const handleResetAllData = () => {
    Alert.alert(
      "🛠️ Reset All Data",
      "This will clear all cached data including:\n\n• Device & Member IDs\n• Group selections\n• Tracking state\n• PIN settings\n\nYou'll need to start fresh. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              const clearedCount = await clearAllAppData();
              Alert.alert(
                "Success",
                `Cleared ${clearedCount} cached items. Close and reopen the app to start fresh.`,
                [{ text: "OK" }],
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear data: " + error.message);
            } finally {
              setResetting(false);
            }
          },
        },
      ],
    );
  };

  const handleTestBreaches = async () => {
    setTestingBreaches(true);
    try {
      const response = await fetch("/api/debug/breach-test");
      if (!response.ok) {
        throw new Error("Failed to fetch breach test");
      }
      const data = await response.json();

      const breachCount = data.breaches?.length || 0;
      const breachList =
        data.breaches
          ?.map(
            (b) =>
              `• ${b.member} → ${b.zoneOwner}'s "${b.zone}" (${b.distance}m away)`,
          )
          .join("\n") || "None detected";

      Alert.alert(
        "🔍 Breach Detection Test",
        `Timestamp: ${new Date(data.timestamp).toLocaleTimeString()}\n\n` +
          `📍 ${data.members} member(s) with locations\n` +
          `🛡️ ${data.geofences} geofence(s) active\n\n` +
          `🚨 ${breachCount} breach(es) detected:\n\n${breachList}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Breach test error:", error);
      Alert.alert("Error", "Failed to run breach test: " + error.message);
    } finally {
      setTestingBreaches(false);
    }
  };

  const handleManagePin = async () => {
    if (pinEnabled) {
      // Show options to change or remove PIN
      Alert.alert(
        "PIN Protection",
        "Your PIN is currently active. What would you like to do?",
        [
          {
            text: "Change PIN",
            onPress: () =>
              router.push({
                pathname: "/auth/pin-setup-account",
                params: { returnTo: "/(tabs)/profile" },
              }),
          },
          {
            text: "Remove PIN",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await fetch("/api/auth/pin", {
                  method: "DELETE",
                });

                if (response.ok) {
                  await SecureStore.deleteItemAsync("pin_enabled");
                  await SecureStore.deleteItemAsync("pin_user_email");
                  setPinEnabled(false);
                  Alert.alert("Success", "PIN protection has been removed.");
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to remove PIN. Please try again.",
                  );
                }
              } catch (error) {
                console.error("Error removing PIN:", error);
                Alert.alert("Error", "Failed to remove PIN.");
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } else {
      // Set up new PIN
      router.push({
        pathname: "/auth/pin-setup-account",
        params: { returnTo: "/(tabs)/profile" },
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const isActive = status === "active";
  const membershipStatusColor =
    isActive && !needsRenewal
      ? "#10B981"
      : needsRenewal
        ? "#F59E0B"
        : "#EF4444";
  const MembershipIcon = isActive && !needsRenewal ? CheckCircle : AlertCircle;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <FixedHeader
        title="Profile"
        subtitle="Manage your account and settings"
        showBorder={showHeaderBorder}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Return to Adventure Button */}
        {currentAdventure && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.green,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              router.push({
                pathname: "/(tabs)/tracking",
                params: { memberId: currentAdventure.id },
              });
            }}
          >
            <Navigation
              size={20}
              color="#FFFFFF"
              fill="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Return to Active Adventure
            </Text>
          </TouchableOpacity>
        )}

        <UserProfileSection />

        {/* Membership Status Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderLeftWidth: 4,
            borderLeftColor: membershipStatusColor,
          }}
          onPress={() => router.push("/membership-status")}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: membershipStatusColor + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <MembershipIcon size={24} color={membershipStatusColor} />
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
              Membership Status
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: membershipStatusColor,
              }}
            >
              {membershipLoading
                ? "Loading..."
                : isActive && !needsRenewal
                  ? "Active • $25 NZD/year"
                  : needsRenewal
                    ? "Renewal Required"
                    : "No Active Membership"}
            </Text>
          </View>
          <CreditCard size={20} color={colors.secondary} />
        </TouchableOpacity>

        {/* PIN Protection Section */}
        {!checkingPin && (
          <View style={{ marginBottom: 20 }}>
            <SettingRow
              icon={pinEnabled ? Shield : Lock}
              title={
                pinEnabled ? "PIN Protection: Enabled" : "Set Up PIN Protection"
              }
              subtitle={
                pinEnabled
                  ? "Tap to change or remove your PIN"
                  : "Secure your app with a custom PIN"
              }
              onPress={handleManagePin}
              color={pinEnabled ? "#10B981" : colors.blue}
            />
          </View>
        )}

        <EmergencyContactsSection
          contactsData={contactsData}
          contactsError={contactsError}
          refetchContacts={refetchContacts}
          isRefetchingContacts={isRefetchingContacts}
          onAddContact={() => setShowAddContactModal(true)}
          onDeleteContact={(contactId) =>
            deleteContactMutation.mutate(contactId)
          }
        />

        <PrivacyPermissionsSection
          locationEnabled={locationEnabled}
          toggleLocation={toggleLocation}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
        />

        <AboutSection />

        {/* Developer Tools - Only shown in dev mode */}
        {isDev && (
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <SettingRow
              icon={Shield}
              title="Developer: Test Breach Detection"
              subtitle="Check for geofence intrusions across all members"
              onPress={testingBreaches ? null : handleTestBreaches}
              color="#3B82F6"
              disabled={testingBreaches}
            />

            <SettingRow
              icon={Wrench}
              title="Developer: Reset All Data"
              subtitle="Clear cached device IDs, member data, and settings"
              onPress={resetting ? null : handleResetAllData}
              color="#F59E0B"
              disabled={resetting}
            />
          </View>
        )}

        <SignOutButton />
      </ScrollView>

      {/* Ad Banner - Just above tab bar */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <AdBanner />
      </View>

      <AddContactModal
        visible={showAddContactModal}
        onClose={() => {
          setShowAddContactModal(false);
          setNewContact({
            name: "",
            phone: "",
            relationship: "",
            preferredMethod: "sms",
          });
        }}
        newContact={newContact}
        setNewContact={setNewContact}
        onAddContact={handleAddContact}
        isAdding={addContactMutation.isPending}
      />
    </View>
  );
}
