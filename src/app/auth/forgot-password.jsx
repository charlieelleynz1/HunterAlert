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
import { Mail, ArrowLeft } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fontsLoaded, error] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("[ForgotPassword] Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded && !error) {
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

        {/* Header */}
        <View style={{ marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.blueLight,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Mail size={40} color={colors.blue} strokeWidth={2} />
          </View>

          <Text
            style={{
              fontSize: 32,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              marginBottom: 12,
            }}
          >
            Forgot Password?
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 24,
            }}
          >
            No worries! Enter your email and we'll send you a reset link
          </Text>
        </View>

        {/* Success Message */}
        {success && (
          <View
            style={{
              backgroundColor: colors.greenLight,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.green,
                lineHeight: 20,
              }}
            >
              Check your email! If an account exists with that address, we've
              sent a password reset link.
            </Text>
          </View>
        )}

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
              onSubmitEditing={handleSubmit}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Submit Button */}
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
          onPress={handleSubmit}
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

        {/* Back to Sign In */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
            }}
          >
            Remember your password?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.blue,
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
