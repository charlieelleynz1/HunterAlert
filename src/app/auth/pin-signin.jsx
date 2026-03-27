import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Lock, Delete, ArrowLeft, Mail } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/utils/auth/useAuth";

export default function PinSignInScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(true);

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    // Load saved email if available
    const loadEmail = async () => {
      const savedEmail = await SecureStore.getItemAsync("pin_user_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setShowEmailInput(false);
      }
    };
    loadEmail();
  }, []);

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    // Save the email for future use
    await SecureStore.setItemAsync("pin_user_email", email.trim());
    setShowEmailInput(false);
  };

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
      // Verify PIN with server
      const response = await fetch("/api/auth/pin-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          pin: enteredPin,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.jwt && data.user) {
          await SecureStore.setItemAsync("pin_enabled", "true");
          await SecureStore.setItemAsync("pin_user_email", email.trim());
          await setAuth({ jwt: data.jwt, user: data.user });
          router.replace("/(tabs)");
        } else {
          throw new Error("Invalid response from server");
        }
      } else {
        // Wrong PIN
        Vibration.vibrate([0, 100, 100, 100]);
        setPin("");
        setAttempts(attempts + 1);

        if (attempts >= 4) {
          Alert.alert(
            "Too Many Attempts",
            "For security, please sign in with your email and password instead.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        } else {
          const errorData = await response.json();
          Alert.alert(
            "Incorrect PIN",
            errorData.error || `${5 - attempts - 1} attempts remaining`,
          );
        }
      }
    } catch (error) {
      console.error("PIN sign-in error:", error);
      Alert.alert(
        "Sign In Failed",
        "Could not sign in with PIN. Please try again or use email/password.",
      );
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForgotPin = () => {
    router.push("/auth/forgot-pin");
  };

  const handleChangeEmail = () => {
    setShowEmailInput(true);
    setPin("");
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
          fontFamily: "Montserrat_600SemiBold",
          color: colors.primary,
        }}
      >
        {number}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  // Show email input first
  if (showEmailInput) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />

        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
            }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
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
                fontSize: 28,
                fontFamily: "Montserrat_700Bold",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Sign In with PIN
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                textAlign: "center",
              }}
            >
              Enter your email address first
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.border,
                paddingHorizontal: 16,
              }}
            >
              <Mail
                size={20}
                color={colors.secondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.primary,
                  paddingVertical: 16,
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={handleEmailSubmit}
                autoFocus
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.blue,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.blue,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 6,
            }}
            onPress={handleEmailSubmit}
          >
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show PIN entry
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Back Button */}
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
          }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View
        style={{
          alignItems: "center",
          paddingHorizontal: 24,
          marginBottom: 32,
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
            fontSize: 28,
            fontFamily: "Montserrat_700Bold",
            color: colors.primary,
            marginBottom: 8,
          }}
        >
          Enter Your PIN
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Enter your 4-6 digit PIN to sign in
        </Text>
        <TouchableOpacity onPress={handleChangeEmail}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.blue,
              textAlign: "center",
            }}
          >
            {email} • Change
          </Text>
        </TouchableOpacity>
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
        {isVerifying ? (
          <ActivityIndicator size="large" color={colors.blue} />
        ) : (
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
                    fontSize: 13,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.blue,
                    textAlign: "center",
                  }}
                >
                  Forgot{"\n"}PIN?
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
        )}
      </View>

      <View style={{ paddingBottom: insets.bottom + 20 }} />
    </View>
  );
}
