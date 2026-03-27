import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Vibration } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Lock, Delete } from "lucide-react-native";
import { useAppTheme } from "../utils/theme";
import { storage } from "../utils/storage";
import * as SecureStore from "expo-secure-store";

export default function PinEntryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleNumberPress = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-verify when 4-6 digits entered
      if (newPin.length >= 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const verifyPin = async (enteredPin) => {
    setIsVerifying(true);

    try {
      // Get stored member ID and device ID
      const memberId = await SecureStore.getItemAsync("pin_member_id");
      const deviceId = await storage.getItem("device_id");

      if (!memberId || !deviceId) {
        Alert.alert(
          "Error",
          "PIN setup is incomplete. Please set up your PIN again.",
        );
        await SecureStore.deleteItemAsync("pin_enabled");
        await SecureStore.deleteItemAsync("pin_member_id");
        router.replace("/(tabs)");
        return;
      }

      // Verify PIN with server
      const response = await fetch(`/api/members/${memberId}/pin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: enteredPin,
          deviceId,
        }),
      });

      if (response.ok) {
        // Success! Grant access
        router.replace("/(tabs)");
      } else {
        // Wrong PIN
        Vibration.vibrate([0, 100, 100, 100]);
        setPin("");
        setAttempts(attempts + 1);

        if (attempts >= 4) {
          Alert.alert(
            "Too Many Attempts",
            "For security, please restart the app and try again.",
            [{ text: "OK" }],
          );
        } else {
          Alert.alert(
            "Incorrect PIN",
            `${5 - attempts - 1} attempts remaining`,
          );
        }
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      Alert.alert("Error", "Failed to verify PIN. Please try again.");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForgotPin = () => {
    Alert.alert(
      "Forgot PIN?",
      "To reset your PIN, you'll need to clear app data in your phone settings and set up the app again.",
      [{ text: "OK" }],
    );
  };

  const renderDot = (index) => {
    const isFilled = index < pin.length;
    return (
      <View
        key={index}
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: isFilled ? colors.blue : "transparent",
          borderWidth: 2,
          borderColor: colors.blue,
          marginHorizontal: 8,
        }}
      />
    );
  };

  const NumberButton = ({ number }) => (
    <TouchableOpacity
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
        margin: 8,
      }}
      onPress={() => handleNumberPress(number.toString())}
      disabled={isVerifying}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "600",
          color: colors.primary,
        }}
      >
        {number}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 40,
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.blue + "20",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Lock size={40} color={colors.blue} />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: colors.primary,
            marginBottom: 8,
          }}
        >
          Enter Your PIN
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.secondary,
            textAlign: "center",
          }}
        >
          Enter your 4-6 digit PIN to continue
        </Text>
      </View>

      {/* PIN Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingVertical: 48,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map(renderDot)}
      </View>

      {/* Number Pad */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 280 }}>
          {/* Row 1 */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <NumberButton number={1} />
            <NumberButton number={2} />
            <NumberButton number={3} />
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <NumberButton number={4} />
            <NumberButton number={5} />
            <NumberButton number={6} />
          </View>

          {/* Row 3 */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <NumberButton number={7} />
            <NumberButton number={8} />
            <NumberButton number={9} />
          </View>

          {/* Row 4 */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                width: 80,
                height: 80,
                justifyContent: "center",
                alignItems: "center",
                margin: 8,
              }}
              onPress={handleForgotPin}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.blue,
                  fontWeight: "600",
                }}
              >
                Forgot?
              </Text>
            </TouchableOpacity>

            <NumberButton number={0} />

            <TouchableOpacity
              style={{
                width: 80,
                height: 80,
                justifyContent: "center",
                alignItems: "center",
                margin: 8,
              }}
              onPress={handleDelete}
              disabled={pin.length === 0 || isVerifying}
            >
              <Delete
                size={28}
                color={pin.length > 0 ? colors.primary : colors.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom + 20 }} />
    </View>
  );
}
