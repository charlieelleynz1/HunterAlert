import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import { MapPin, Shield, Users, ArrowRight } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import { storage } from "@/utils/storage";
import { router } from "expo-router";

export default function LaunchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { isReady } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleSignIn = async () => {
    router.push("/auth/email-signin");
  };

  const handleSignUp = async () => {
    router.push("/auth/email-signup");
  };

  const handleContinueAsGuest = async () => {
    // Store guest mode flag
    await storage.setItem("guestMode", "true");
    router.replace("/(tabs)");
  };

  if (!fontsLoaded || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          {/* App Icon */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              backgroundColor: colors.blue,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              shadowColor: colors.blue,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <MapPin size={60} color="#FFFFFF" strokeWidth={2.5} />
          </View>

          <Text
            style={{
              fontSize: 36,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Hunter Safe
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
              lineHeight: 26,
              paddingHorizontal: 20,
            }}
          >
            Track your location during outdoor activities and get alerted when
            entering hunting zones
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={{ marginBottom: 48 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: colors.blueLight,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <MapPin size={26} color={colors.blue} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 4,
                }}
              >
                Hunter & Adventurer Modes
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                  lineHeight: 20,
                }}
              >
                Track as a hunter or adventurer with real-time location updates
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: colors.greenLight,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Shield size={26} color={colors.green} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 4,
                }}
              >
                Mobile Hunting Zones
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                  lineHeight: 20,
                }}
              >
                Create hunting zones that follow you and alert nearby
                adventurers
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: colors.purpleLight,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Users size={26} color={colors.purple} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 4,
                }}
              >
                Emergency Alerts
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                  lineHeight: 20,
                }}
              >
                Automatic SOS alerts when overdue from your adventure
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={{ gap: 16 }}>
          {/* Sign In Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#8B5CF6",
              borderRadius: 20,
              paddingVertical: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
            onPress={handleSignIn}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Montserrat_700Bold",
                    color: "#FFFFFF",
                    marginRight: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  Sign In
                </Text>
                <ArrowRight size={22} color="#FFFFFF" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>

          {/* Create Account Button - Vibrant Green */}
          <TouchableOpacity
            style={{
              backgroundColor: "#10B981",
              borderRadius: 20,
              paddingVertical: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
            onPress={handleSignUp}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Montserrat_700Bold",
                    color: "#FFFFFF",
                    letterSpacing: 0.5,
                  }}
                >
                  Create Account
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Guest Mode Button - Vibrant Orange */}
          <TouchableOpacity
            style={{
              backgroundColor: "#F59E0B",
              borderRadius: 20,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={handleContinueAsGuest}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
                letterSpacing: 0.3,
              }}
            >
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
            lineHeight: 18,
            marginTop: 32,
            paddingHorizontal: 20,
          }}
        >
          Your location data is used only for safety features and is never sold
          to third parties
        </Text>
      </ScrollView>
    </View>
  );
}
