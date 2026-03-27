import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/utils/auth/useAuth";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const { isAuthenticated, isReady } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [checkingGuest, setCheckingGuest] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [checkingWelcome, setCheckingWelcome] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const guestMode = await storage.getItem("guestMode");
      const welcomeSeen = await storage.getItem("welcomeSeen");
      console.log("[Index] Guest mode check:", guestMode);
      console.log("[Index] Welcome seen check:", welcomeSeen);
      setIsGuestMode(guestMode === "true");
      setHasSeenWelcome(welcomeSeen === "true");
      setCheckingGuest(false);
      setCheckingWelcome(false);

      // Check if PIN is enabled
      try {
        const enabled = await SecureStore.getItemAsync("pin_enabled");
        setPinEnabled(enabled === "true");
        console.log("[Index] PIN enabled check:", enabled === "true");
      } catch (error) {
        console.error("[Index] Error checking PIN:", error);
        setPinEnabled(false);
      } finally {
        setCheckingPin(false);
      }
    };
    checkStatus();
  }, []);

  // Wait for all checks
  if (!isReady || checkingGuest || checkingWelcome || checkingPin) {
    console.log(
      "[Index] Still loading - isReady:",
      isReady,
      "checkingGuest:",
      checkingGuest,
      "checkingWelcome:",
      checkingWelcome,
      "checkingPin:",
      checkingPin,
    );
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Route based on state
  console.log(
    "[Index] Routing decision - isAuthenticated:",
    isAuthenticated,
    "isGuestMode:",
    isGuestMode,
    "hasSeenWelcome:",
    hasSeenWelcome,
    "pinEnabled:",
    pinEnabled,
  );

  // If authenticated or in guest mode
  if (isAuthenticated || isGuestMode) {
    // Check if PIN is required
    if (pinEnabled) {
      console.log("[Index] PIN required - redirecting to PIN entry");
      return <Redirect href="/pin-entry" />;
    }

    console.log("[Index] Redirecting to tabs");
    return <Redirect href="/(tabs)" />;
  }

  // First-time user - show welcome screen
  if (!hasSeenWelcome) {
    console.log("[Index] First-time user - showing welcome");
    return <Redirect href="/welcome" />;
  }

  // Returning user - go to launch/auth
  console.log("[Index] Returning user - redirecting to auth/launch");
  return <Redirect href="/auth/launch" />;
}
