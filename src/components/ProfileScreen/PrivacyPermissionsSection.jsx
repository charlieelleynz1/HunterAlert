import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MapPin, Bell, Volume2, VolumeX } from "lucide-react-native";
import { useAppTheme } from "../../utils/theme";
import { SettingRow } from "./SettingRow";
import { storage } from "../../utils/storage";
import {
  useAlarmAudio,
  forceReinitializeAudio,
} from "../../hooks/useAlarmAudio";

export function PrivacyPermissionsSection({
  locationEnabled,
  toggleLocation,
  notificationsEnabled,
  setNotificationsEnabled,
}) {
  const { colors } = useAppTheme();
  const { audioReady, alarmPlayer, sirenPlayer } = useAlarmAudio();
  const [testingAudio, setTestingAudio] = useState(false);

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    await storage.setItem("notificationsEnabled", JSON.stringify(value));
  };

  const testAudio = async () => {
    if (testingAudio) return;

    setTestingAudio(true);
    console.log("🔊 MANUAL AUDIO TEST STARTED");

    try {
      if (!audioReady || !alarmPlayer) {
        Alert.alert(
          "Audio Not Ready",
          "Audio system is still initializing. Please wait a moment and try again.",
          [{ text: "OK" }],
        );
        setTestingAudio(false);
        return;
      }

      console.log("🔊 ALARM PLAYER STATE:", {
        isLoaded: alarmPlayer.isLoaded,
        playing: alarmPlayer.playing,
        volume: alarmPlayer.volume,
        muted: alarmPlayer.muted,
      });

      // Stop if playing
      if (alarmPlayer.playing) {
        alarmPlayer.pause();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Configure for test (non-looping)
      alarmPlayer.seekTo(0);
      alarmPlayer.volume = 1.0;
      alarmPlayer.loop = false;

      // Play
      alarmPlayer.play();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const success = alarmPlayer.playing;
      console.log("🔊 AUDIO TEST RESULT:", success);

      if (success) {
        Alert.alert(
          "✅ Audio Working!",
          "Audio system is working correctly. You should hear zone alerts during your adventure.",
          [
            {
              text: "Stop",
              onPress: () => {
                alarmPlayer.pause();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "⚠️ Audio Issue",
          "Audio failed to play. Check if:\n\n• Phone is not on silent mode\n• Volume is turned up\n• No headphones blocking speaker\n\nTry using the 'Reinitialize Audio' button below.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("❌ Audio test error:", error);
      Alert.alert("Error", "Audio test failed: " + error.message);
    } finally {
      setTestingAudio(false);
    }
  };

  const testSiren = async () => {
    if (testingAudio) return;

    setTestingAudio(true);
    console.log("🔊 MANUAL SIREN TEST STARTED");

    try {
      if (!audioReady || !sirenPlayer) {
        Alert.alert(
          "Audio Not Ready",
          "Audio system is still initializing. Please wait a moment and try again.",
          [{ text: "OK" }],
        );
        setTestingAudio(false);
        return;
      }

      if (sirenPlayer.playing) {
        sirenPlayer.pause();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      sirenPlayer.seekTo(0);
      sirenPlayer.volume = 1.0;
      sirenPlayer.loop = false;
      sirenPlayer.play();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const success = sirenPlayer.playing;
      console.log("🔊 SIREN TEST RESULT:", success);

      if (success) {
        Alert.alert(
          "✅ Siren Working!",
          "Hunter siren is working. This is the sound that plays when a hunting breach occurs.",
          [
            {
              text: "Stop",
              onPress: () => {
                sirenPlayer.pause();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "⚠️ Siren Issue",
          "Siren failed to play. Check volume and silent mode settings.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("❌ Siren test error:", error);
      Alert.alert("Error", "Siren test failed: " + error.message);
    } finally {
      setTestingAudio(false);
    }
  };

  const reinitAudio = async () => {
    Alert.alert(
      "Reinitialize Audio?",
      "This will reset the audio system. Use this if alerts are not playing sound.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reinitialize",
          onPress: async () => {
            console.log("🔄 User requested audio reinit");
            await forceReinitializeAudio();
            Alert.alert(
              "Audio Reset",
              "Audio system reinitialized. Test it using the buttons above.",
              [{ text: "OK" }],
            );
          },
        },
      ],
    );
  };

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
        Privacy & Permissions
      </Text>

      {/* Background Location Explanation Banner */}
      <View
        style={{
          backgroundColor: colors.blueLight || "#EFF6FF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: colors.blue,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            marginBottom: 8,
          }}
        >
          📍 Why We Need Background Location
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            lineHeight: 18,
          }}
        >
          Background location allows us to:{"\n"}• Continue tracking during
          active adventures even when your screen is off{"\n"}• Detect geofence
          breaches in real-time to alert you immediately{"\n"}• Send automatic
          SOS alerts if you become overdue{"\n"}• Queue location updates when
          offline in remote areas{"\n\n"}
          <Text style={{ fontFamily: "Montserrat_600SemiBold" }}>
            Location is only collected during active tracking sessions
          </Text>{" "}
          (between "Start Adventure" and "End Adventure"). You can stop sharing
          anytime.
        </Text>
      </View>

      <SettingRow
        icon={MapPin}
        title="Location Sharing"
        subtitle="Share your location with group members"
        value={locationEnabled}
        onToggle={toggleLocation}
        color={colors.blue}
      />

      <SettingRow
        icon={Bell}
        title="Geofence Alarms"
        subtitle="Loud alarm when members cross geofence boundaries"
        value={notificationsEnabled}
        onToggle={handleNotificationToggle}
        color={colors.green}
      />

      {/* Audio System Status */}
      <View
        style={{
          backgroundColor: audioReady ? "#F0FDF4" : "#FEF3C7",
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          borderWidth: 1,
          borderColor: audioReady ? "#86EFAC" : "#FCD34D",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {audioReady ? (
            <Volume2 size={20} color="#16A34A" />
          ) : (
            <VolumeX size={20} color="#D97706" />
          )}
          <Text
            style={{
              marginLeft: 8,
              fontSize: 15,
              fontFamily: "Montserrat_600SemiBold",
              color: audioReady ? "#16A34A" : "#D97706",
            }}
          >
            Audio System: {audioReady ? "Ready" : "Loading..."}
          </Text>
        </View>

        {audioReady && (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={testAudio}
              disabled={testingAudio}
              style={{
                backgroundColor: "#16A34A",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                }}
              >
                {testingAudio ? "Testing..." : "🔔 Test Zone Alarm"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={testSiren}
              disabled={testingAudio}
              style={{
                backgroundColor: "#DC2626",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                }}
              >
                {testingAudio ? "Testing..." : "🚨 Test Hunter Siren"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={reinitAudio}
              style={{
                backgroundColor: "#D97706",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                }}
              >
                🔄 Reinitialize Audio
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!audioReady && (
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: "#92400E",
              marginTop: 4,
            }}
          >
            Audio is loading in the background. It should be ready in a few
            seconds.
          </Text>
        )}
      </View>

      <View style={{ height: 24 }} />
    </>
  );
}
