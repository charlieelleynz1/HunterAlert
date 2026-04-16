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
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";

export default function EmailSignInScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded, error] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password.",
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("[SignIn] Attempting sign in for:", email);
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          mode: "signin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[SignIn] Server error:", errorData);
        throw new Error(errorData.error || "Failed to sign in");
      }

      const data = await response.json();
      console.log("[SignIn] Server response received, has JWT:", !!data.jwt);

      if (data.jwt && data.user) {
        console.log("[SignIn] Calling setAuth...");
        await setAuth({ jwt: data.jwt, user: data.user });
        console.log("[SignIn] setAuth completed");

        // Success! Navigate to tabs
        router.replace("/(tabs)");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("[SignIn] Sign in error:", error);
      Alert.alert(
        "Sign In Failed",
        error.message ||
          "Could not sign in. Please check your credentials and try again.",
      );
    } finally {
      // ALWAYS reset loading state, even on success
      console.log("[SignIn] Resetting loading state");
      setIsLoading(false);
    }
  };

  const handleSignInWithPin = () => {
    router.push("/auth/pin-signin");
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
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              marginBottom: 12,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 24,
            }}
          >
            Sign in with your email to continue
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            Email
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
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            Password
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
            <Lock
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
              placeholder="Enter your password"
              placeholderTextColor={colors.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleSignIn}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 4 }}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.secondary} />
              ) : (
                <Eye size={20} color={colors.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
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
          onPress={handleSignIn}
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
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign in with PIN Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            borderWidth: 2,
            borderColor: colors.blue,
          }}
          onPress={handleSignInWithPin}
          disabled={isLoading}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Lock size={20} color={colors.blue} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.blue,
              }}
            >
              Sign In with PIN
            </Text>
          </View>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={{ alignItems: "center", paddingVertical: 12 }}
          onPress={() => router.push("/auth/forgot-password")}
          disabled={isLoading}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.blue,
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
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
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/email-signup")}
            disabled={isLoading}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.blue,
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
