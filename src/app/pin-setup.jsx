import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Vibration } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Lock, Delete, ArrowLeft, Check } from "lucide-react-native";
import { useAppTheme } from "../utils/theme";
import { storage } from "../utils/storage";
import * as SecureStore from "expo-secure-store";

export default function PinSetupScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { memberId, returnTo } = useLocalSearchParams();

  const [step, setStep] = useState("enter"); // "enter" or "confirm"
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentPin = step === "enter" ? pin : confirmPin;

  const handleNumberPress = (num) => {
    if (currentPin.length < 6) {
      const newPin = currentPin + num;

      if (step === "enter") {
        setPin(newPin);
        // Auto-advance when 4-6 digits
        if (newPin.length >= 4) {
          setTimeout(() => {
            setStep("confirm");
          }, 200);
        }
      } else {
        setConfirmPin(newPin);
        // Auto-verify when lengths match
        if (newPin.length === pin.length) {
          setTimeout(() => {
            verifyAndSave(newPin);
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === "enter") {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("enter");
      setConfirmPin("");
    } else {
      router.back();
    }
  };

  const verifyAndSave = async (confirmedPin) => {
    if (confirmedPin !== pin) {
      Vibration.vibrate([0, 100, 100, 100]);
      Alert.alert("PINs Don't Match", "Please try again.", [
        {
          text: "OK",
          onPress: () => {
            setStep("enter");
            setPin("");
            setConfirmPin("");
          },
        },
      ]);
      return;
    }

    setIsSaving(true);

    try {
      const deviceId = await storage.getItem("device_id");

      if (!deviceId) {
        Alert.alert("Error", "Device not identified. Please try again.");
        router.back();
        return;
      }

      // Save PIN to server
      const response = await fetch(`/api/members/${memberId}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: confirmedPin,
          deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set PIN");
      }

      // Store PIN status in secure storage
      await SecureStore.setItemAsync("pin_enabled", "true");
      await SecureStore.setItemAsync("pin_member_id", memberId.toString());

      Alert.alert(
        "PIN Set Successfully! 🎉",
        "Your PIN has been saved. You'll need to enter it when you open the app.",
        [
          {
            text: "OK",
            onPress: () => {
              if (returnTo) {
                router.replace(returnTo);
              } else {
                router.back();
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error setting PIN:", error);
      Alert.alert("Error", "Failed to save PIN. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderDot = (index) => {
    const isFilled = index < currentPin.length;
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
      disabled={isSaving}
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
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor:
                step === "confirm" ? colors.green + "20" : colors.blue + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {step === "confirm" ? (
              <Check size={40} color={colors.green} />
            ) : (
              <Lock size={40} color={colors.blue} />
            )}
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            {step === "enter" ? "Create Your PIN" : "Confirm Your PIN"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            {step === "enter"
              ? "Choose a 4-6 digit PIN"
              : "Enter your PIN again to confirm"}
          </Text>
        </View>
      </View>

      {/* PIN Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingVertical: 32,
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
            <View style={{ width: 80, height: 80, margin: 8 }} />
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
              disabled={currentPin.length === 0 || isSaving}
            >
              <Delete
                size={28}
                color={
                  currentPin.length > 0 ? colors.primary : colors.secondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ paddingBottom: insets.bottom + 20 }} />
    </View>
  );
}
