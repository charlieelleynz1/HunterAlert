import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import {
  AlertCircle,
  Phone,
  MapPin,
  Shield,
  MessageSquare,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { sendEmergencySOSWithFallback, canSendSMS } from "@/utils/nativeSMS";
import { canSendWhatsApp } from "@/utils/nativeWhatsApp";
import { resetState } from "@/utils/resetState";

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [sendingAlert, setSendingAlert] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const { userName } = useDeviceIdentity();
  const [smsSupported, setSmsSupported] = useState(true);
  const [whatsAppSupported, setWhatsAppSupported] = useState(false);
  const [resetInProgress, setResetInProgress] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Get emergency contacts count
  const { data: contactsData } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const response = await fetch("/api/emergency-contacts");
      if (!response.ok) throw new Error("Failed to fetch emergency contacts");
      return response.json();
    },
  });

  // Check SMS and WhatsApp support on mount
  React.useEffect(() => {
    canSendSMS().then(setSmsSupported);
    canSendWhatsApp().then(setWhatsAppSupported);
  }, []);

  // Listen to reset state changes for visual feedback
  React.useEffect(() => {
    const unregister = resetState.onChange((isActive) => {
      console.log("SOS: Reset state changed:", isActive);
      setResetInProgress(isActive);
    });
    return unregister;
  }, []);

  const handleSendSOS = async () => {
    // FIRST CHECK: Block if reset is in progress
    if (resetState.isActive()) {
      Alert.alert(
        "🔄 Reset In Progress",
        "SOS is temporarily blocked while a reset operation is completing. This prevents app crashes.\n\nPlease wait a few seconds for the reset to finish.",
        [{ text: "OK" }],
      );
      return;
    }

    const contactCount = contactsData?.contacts?.length || 0;

    if (contactCount === 0) {
      Alert.alert(
        "No Emergency Contacts",
        "Please add emergency contacts in your Profile before sending SOS alerts.",
        [{ text: "OK" }],
      );
      return;
    }

    if (!smsSupported && !whatsAppSupported) {
      Alert.alert(
        "No Messaging Available",
        "Your device doesn't support SMS or WhatsApp. Please ensure you have one of these installed.",
        [{ text: "OK" }],
      );
      return;
    }

    // Build method summary for the confirmation
    const whatsAppContacts = contactsData.contacts.filter(
      (c) => c.preferred_method === "whatsapp" || c.preferred_method === "both",
    ).length;
    const smsContacts = contactsData.contacts.filter(
      (c) =>
        !c.preferred_method ||
        c.preferred_method === "sms" ||
        c.preferred_method === "both",
    ).length;
    let methodSummary = "";
    if (smsContacts > 0 && whatsAppContacts > 0) {
      methodSummary = `via SMS and WhatsApp`;
    } else if (whatsAppContacts > 0) {
      methodSummary = `via WhatsApp`;
    } else {
      methodSummary = `via SMS`;
    }

    Alert.alert(
      "🚨 SEND EMERGENCY SOS",
      `⚠️ THIS WILL IMMEDIATELY:\n\n• Send emergency alerts to ${contactCount} contact${contactCount !== 1 ? "s" : ""} ${methodSummary}\n• Share your GPS location\n• Fall back to alternative method if preferred fails\n\nYour messaging apps will open for each contact. Tap send to deliver.\n\nAre you ready?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "🚨 SEND SOS NOW",
          style: "destructive",
          onPress: async () => {
            // SECOND CHECK: Block if reset started while alert was showing
            if (resetState.isActive()) {
              Alert.alert(
                "🔄 Reset In Progress",
                "SOS is temporarily blocked while a reset operation is completing. This prevents app crashes.\n\nPlease wait a few seconds for the reset to finish.",
                [{ text: "OK" }],
              );
              return;
            }

            console.log("🚨🚨🚨 SOS EMERGENCY - STARTING 🚨🚨🚨");

            setSendingAlert(true);
            try {
              console.log("SOS: Starting SOS send process with fallback");

              // Get current location
              const { status } =
                await Location.requestForegroundPermissionsAsync();
              console.log("SOS: Location permission status:", status);

              if (status !== "granted") {
                Alert.alert(
                  "Error",
                  "Location permission is required to send SOS with your location",
                );
                setSendingAlert(false);
                return;
              }

              console.log("SOS: Getting current location...");

              // Get location with timeout
              const locationPromise = Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Location timeout")), 10000),
              );

              const location = await Promise.race([
                locationPromise,
                timeoutPromise,
              ]);

              console.log(
                "SOS: Location obtained:",
                location.coords.latitude,
                location.coords.longitude,
              );

              // Send via the fallback system
              const result = await sendEmergencySOSWithFallback(
                contactsData.contacts,
                location.coords.latitude,
                location.coords.longitude,
                userName || "Emergency Alert",
              );

              // Also log to backend for record-keeping (non-blocking)
              try {
                fetch("/api/sos/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    userName: userName,
                  }),
                }).catch((err) => console.log("Backend logging failed:", err));
              } catch (e) {
                console.log("Backend logging skipped");
              }

              if (result.total.sent > 0) {
                // Build detailed result message
                const parts = [];
                if (result.sms.sent > 0) {
                  parts.push(`${result.sms.sent} via SMS`);
                }
                if (result.whatsapp.sent > 0) {
                  parts.push(`${result.whatsapp.sent} via WhatsApp`);
                }
                const resultSummary = parts.join(", ");

                Alert.alert(
                  "🚨 SOS ALERT SENT!",
                  `Emergency alerts opened for ${result.total.sent} contact${result.total.sent !== 1 ? "s" : ""} (${resultSummary}).\n\n✅ Make sure to tap SEND in each messaging app to deliver.${result.total.failed > 0 ? `\n\n⚠️ ${result.total.failed} contact${result.total.failed !== 1 ? "s" : ""} could not be reached.` : ""}`,
                  [{ text: "OK" }],
                );
              } else {
                Alert.alert(
                  "Error",
                  "Could not open any messaging app. Please check your device settings.",
                  [{ text: "OK" }],
                );
              }
            } catch (error) {
              console.error("SOS: Error sending SOS:", error);

              if (error.message === "Location timeout") {
                Alert.alert(
                  "Timeout",
                  "Could not get your location. Please check GPS settings and try again.",
                );
              } else {
                Alert.alert(
                  "Error",
                  `Failed to prepare SOS: ${error.message || "Unknown error"}`,
                );
              }
            } finally {
              setSendingAlert(false);
              console.log("✅ SOS PROCESS COMPLETED");
            }
          },
        },
      ],
    );
  };

  const runDiagnostic = async () => {
    console.log("DIAGNOSTIC: Starting connection test");
    setDiagnosticResult("Testing...");

    try {
      // Test 1: Can we reach any API endpoint?
      console.log("DIAGNOSTIC: Test 1 - Testing /api/emergency-contacts");
      const test1 = await fetch("/api/emergency-contacts");
      console.log("DIAGNOSTIC: Test 1 result:", test1.status, test1.ok);

      // Test 2: Can we reach the SOS endpoint with GET?
      console.log("DIAGNOSTIC: Test 2 - Testing GET /api/sos/send");
      try {
        const test2 = await fetch("/api/sos/send");
        console.log("DIAGNOSTIC: Test 2 result:", test2.status);
      } catch (e) {
        console.log("DIAGNOSTIC: Test 2 failed:", e.message);
      }

      // Test 3: Can we POST to the SOS endpoint?
      console.log("DIAGNOSTIC: Test 3 - Testing POST /api/sos/send");
      const test3 = await fetch("/api/sos/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: 0,
          longitude: 0,
          userName: "Test",
        }),
      });
      console.log("DIAGNOSTIC: Test 3 result:", test3.status, test3.ok);
      const test3Data = await test3.json();
      console.log("DIAGNOSTIC: Test 3 response:", test3Data);

      setDiagnosticResult(
        `Test 1: ${test1.ok ? "✓" : "✗"}\n` +
          `Test 3 (POST): ${test3.ok ? "✓" : "✗"} (${test3.status})\n` +
          `Response: ${JSON.stringify(test3Data)}`,
      );
    } catch (error) {
      console.error("DIAGNOSTIC: Error:", error);
      console.error(
        "DIAGNOSTIC: Error details:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
      setDiagnosticResult(`Error: ${error.message}`);
    }
  };

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const contactCount = contactsData?.contacts?.length || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FEE2E2",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <AlertCircle size={48} color="#DC2626" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            Emergency SOS
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            Send an emergency alert to your contacts
          </Text>
        </View>
      </View>

      {/* Reset In Progress Banner */}
      {resetInProgress && (
        <View
          style={{
            backgroundColor: "#FEF3C7",
            borderBottomWidth: 1,
            borderBottomColor: "#F59E0B",
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AlertCircle
              size={20}
              color="#F59E0B"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_600SemiBold",
                  color: "#92400E",
                  marginBottom: 2,
                }}
              >
                Reset In Progress
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Montserrat_500Medium",
                  color: "#92400E",
                  lineHeight: 16,
                }}
              >
                SOS is temporarily blocked while reset completes. This prevents
                crashes.
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Main SOS Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#DC2626",
            borderRadius: 24,
            padding: 32,
            alignItems: "center",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 32,
          }}
          onPress={handleSendSOS}
          disabled={sendingAlert || resetInProgress}
        >
          {sendingAlert ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Shield size={64} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Montserrat_700Bold",
              color: "#FFFFFF",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {sendingAlert ? "Sending..." : "SEND SOS"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: "#FEE2E2",
              textAlign: "center",
            }}
          >
            Tap to send emergency alert
          </Text>
        </TouchableOpacity>

        {/* Info Cards */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Phone size={20} color="#DC2626" style={{ marginRight: 12 }} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
              }}
            >
              SMS + WhatsApp with Fallback
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 20,
            }}
          >
            {contactCount > 0
              ? `Alerts sent to ${contactCount} contact${contactCount !== 1 ? "s" : ""} via their preferred method. If the preferred method fails, automatically falls back to the alternative.`
              : "Add emergency contacts in your Profile to notify them during SOS"}
          </Text>
          {/* Availability indicators */}
          <View style={{ flexDirection: "row", marginTop: 12, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: smsSupported ? "#10B981" : "#EF4444",
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                }}
              >
                SMS {smsSupported ? "Ready" : "Unavailable"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: whatsAppSupported ? "#25D366" : "#EF4444",
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                }}
              >
                WhatsApp {whatsAppSupported ? "Ready" : "Not Installed"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Shield size={20} color="#10B981" style={{ marginRight: 12 }} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
              }}
            >
              Satellite Ready
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 20,
            }}
          >
            Works with satellite services including One.nz satellite SMS and
            Starlink satellite WhatsApp. Set each contact's preferred method in
            your Profile.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <MapPin size={20} color={colors.blue} style={{ marginRight: 12 }} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
              }}
            >
              GPS Location Sharing
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 20,
            }}
          >
            Your current GPS location and Google Maps link will be included in
            each SMS message
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Phone
              size={20}
              color={colors.purple}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
              }}
            >
              Emergency Services
            </Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            For immediate help, always call emergency services
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.blue,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
            onPress={() => {
              Alert.alert(
                "Call Emergency Services",
                "This will dial your local emergency number (111)",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Call",
                    style: "destructive",
                    onPress: () => {
                      // In a real app, this would dial 111
                      Alert.alert(
                        "Note",
                        "In a real emergency, dial 111 immediately",
                      );
                    },
                  },
                ],
              );
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Call 111
            </Text>
          </TouchableOpacity>
        </View>

        {/* Diagnostic Test Button */}
        <TouchableOpacity
          style={{
            marginTop: 24,
            backgroundColor: colors.border,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
          }}
          onPress={runDiagnostic}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.secondary,
            }}
          >
            Run Connection Test
          </Text>
        </TouchableOpacity>
        {diagnosticResult && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Montserrat_500Medium",
                color: colors.primary,
              }}
            >
              {diagnosticResult}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
