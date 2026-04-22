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
  Modal,
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
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import { WebView } from "react-native-webview";

export default function EmailSignUpScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { setAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [showPinSetupOffer, setShowPinSetupOffer] = useState(false);
  const [userId, setUserId] = useState(null);

  const [fontsLoaded, error] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password.",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long.",
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("[SignUp] Attempting sign up for:", email);
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
          mode: "signup",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[SignUp] Server error:", errorData);
        throw new Error(errorData.error || "Failed to create account");
      }

      const data = await response.json();
      console.log("[SignUp] Server response received, has JWT:", !!data.jwt);

      if (data.jwt && data.user) {
        console.log("[SignUp] Calling setAuth...");
        await setAuth({ jwt: data.jwt, user: data.user });
        console.log("[SignUp] setAuth completed");

        // Now redirect to membership payment
        console.log("[SignUp] Creating membership checkout...");
        const checkoutResponse = await fetch("/api/membership-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            email: email.trim(),
            redirectURL: `${process.env.EXPO_PUBLIC_APP_URL}`,
          }),
        });

        if (!checkoutResponse.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { url } = await checkoutResponse.json();
        console.log("[SignUp] Opening checkout URL...");
        setCheckoutUrl(url);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("[SignUp] Sign up error:", error);
      Alert.alert(
        "Sign Up Failed",
        error.message || "Could not create account. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleWebViewClose = async () => {
    console.log(
      "[SignUp] Payment completed or cancelled, navigating to app...",
    );
    setCheckoutUrl(null);
    setIsLoading(false);

    // Offer PIN setup after successful payment
    setShowPinSetupOffer(true);
  };

  const handleSetupPinLater = () => {
    setShowPinSetupOffer(false);
    router.replace("/(tabs)");
  };

  const handleSetupPinNow = () => {
    setShowPinSetupOffer(false);
    router.replace({
      pathname: "/auth/pin-setup-account",
      params: {
        returnTo: "/(tabs)",
      },
    });
  };

  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.startsWith(process.env.EXPO_PUBLIC_APP_URL)) {
      handleWebViewClose();
      return false;
    }
    return true;
  };

  if (!fontsLoaded && !error) {
    return null;
  }

  // Show payment WebView if checkout URL is available
  if (checkoutUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              textAlign: "center",
            }}
          >
            Complete Membership Payment
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            $25 NZD Annual Membership
          </Text>
        </View>
        <WebView
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        />
      </View>
    );
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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 24,
            }}
          >
            Sign up to start tracking your group
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.blue,
              marginTop: 8,
            }}
          >
            Annual Membership: $25 NZD
          </Text>
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            Name (Optional)
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
            <User
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
              placeholder="Your name"
              placeholderTextColor={colors.secondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              editable={!isLoading}
            />
          </View>
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
        <View style={{ marginBottom: 32 }}>
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
              placeholder="At least 6 characters"
              placeholderTextColor={colors.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleSignUp}
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

        {/* Sign Up Button */}
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
          onPress={handleSignUp}
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
              Create Account & Pay $25 NZD
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
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
            Already have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/email-signin")}
            disabled={isLoading}
          >
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

      {/* PIN Setup Offer Modal */}
      <Modal
        visible={showPinSetupOffer}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSetupPinLater}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 24,
              padding: 32,
              width: "100%",
              maxWidth: 400,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
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

            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Montserrat_700Bold",
                color: colors.primary,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Secure Your Account
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 32,
              }}
            >
              Set up a PIN for quick and secure sign-in. You can use your PIN
              instead of your password next time.
            </Text>

            {/* Set Up Now Button */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.blue,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                shadowColor: colors.blue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleSetupPinNow}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                Set Up PIN Now
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                alignItems: "center",
              }}
              onPress={handleSetupPinLater}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.secondary,
                }}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
