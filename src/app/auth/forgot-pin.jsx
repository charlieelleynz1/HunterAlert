import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { Mail, ArrowLeft, Shield } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import * as SecureStore from "expo-secure-store";

export default function ForgotPinScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleResetPin = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/pin-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reset email");
      }

      Alert.alert(
        "Check Your Email",
        "We've sent you instructions to reset your PIN. The link will expire in 1 hour.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("PIN reset error:", error);
      Alert.alert(
        "Reset Failed",
        error.message || "Could not send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPinLocally = async () => {
    Alert.alert(
      "Clear PIN Locally",
      "This will remove PIN protection from this device only. You'll need to sign in with your email and password.\n\nNote: Your PIN will still be active if you sign in on another device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear PIN",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("pin_enabled");
              await SecureStore.deleteItemAsync("pin_user_email");

              Alert.alert(
                "PIN Cleared",
                "PIN protection has been removed from this device. You can now sign in with your email and password.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/auth/email-signin"),
                  },
                ],
              );
            } catch (error) {
              console.error("Error clearing PIN:", error);
              Alert.alert("Error", "Failed to clear PIN. Please try again.");
            }
          },
        },
      ],
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.blue + "20",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginBottom: 24,
          }}
        >
          <Shield size={40} color={colors.blue} />
        </View>

        {/* Header */}
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Reset Your PIN
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 24,
              textAlign: "center",
            }}
          >
            Enter your email address and we'll send you a link to reset your PIN
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 32 }}>
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
              returnKeyType="send"
              onSubmitEditing={handleResetPin}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Send Reset Link Button */}
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
            marginBottom: 20,
            opacity: isLoading ? 0.7 : 1,
          }}
          onPress={handleResetPin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Send Reset Link
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 24,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              paddingHorizontal: 16,
            }}
          >
            OR
          </Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border,
            }}
          />
        </View>

        {/* Clear PIN Locally Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            borderWidth: 2,
            borderColor: colors.border,
          }}
          onPress={handleClearPinLocally}
          disabled={isLoading}
        >
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.secondary,
            }}
          >
            Clear PIN on This Device
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
            lineHeight: 20,
            marginTop: 24,
          }}
        >
          Need more help? You can always sign in with your email and password
          instead.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
