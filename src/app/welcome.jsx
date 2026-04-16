import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import {
  Compass,
  Mountain,
  Shield,
  Radio,
  ArrowRight,
  Sparkles,
  Trees,
  MapPin,
} from "lucide-react-native";
import { storage } from "@/utils/storage";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  const handleStartAdventure = async () => {
    // Mark welcome as seen
    await storage.setItem("welcomeSeen", "true");
    router.replace("/auth/launch");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#0F172A", "#1E3A5F", "#2D5F7E"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
        }}
      />

      {/* Decorative Background Elements */}
      <View
        style={{ position: "absolute", top: 100, right: -50, opacity: 0.1 }}
      >
        <Mountain size={200} color="#FFFFFF" strokeWidth={1} />
      </View>
      <View
        style={{ position: "absolute", bottom: 200, left: -30, opacity: 0.08 }}
      >
        <Compass size={180} color="#10B981" strokeWidth={1} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={{
            paddingTop: insets.top + 60,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          {/* Glowing Compass Icon */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: "#10B981",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.6,
                shadowRadius: 30,
                elevation: 20,
              }}
            >
              <Compass size={70} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            {/* Sparkle decorations */}
            <View style={{ position: "absolute", top: -5, right: -5 }}>
              <Sparkles size={32} color="#F59E0B" fill="#F59E0B" />
            </View>
            <View style={{ position: "absolute", bottom: 10, left: -10 }}>
              <Sparkles size={24} color="#3B82F6" fill="#3B82F6" />
            </View>
          </View>

          <Text
            style={{
              fontSize: 42,
              fontFamily: "Montserrat_800ExtraBold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: -1,
            }}
          >
            Hunter Safe
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_600SemiBold",
              color: "#10B981",
              textAlign: "center",
              marginBottom: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Adventure Awaits
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontFamily: "Montserrat_500Medium",
              color: "#CBD5E1",
              textAlign: "center",
              lineHeight: 26,
              marginBottom: 50,
            }}
          >
            Track your outdoor adventures, stay safe in hunting zones, and
            explore with confidence
          </Text>

          {/* Colorful Feature Cards */}
          <View style={{ width: "100%", gap: 20, marginBottom: 50 }}>
            {/* Card 1 - Vibrant Orange */}
            <View
              style={{
                backgroundColor: "rgba(249, 115, 22, 0.15)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 2,
                borderColor: "rgba(249, 115, 22, 0.3)",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: "#F97316",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#F97316",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Mountain size={36} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_700Bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Track Your Adventures
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_500Medium",
                  color: "#CBD5E1",
                  lineHeight: 22,
                }}
              >
                Real-time location tracking for hunters and outdoor enthusiasts.
                Never lose your way.
              </Text>
            </View>

            {/* Card 2 - Vibrant Purple */}
            <View
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 2,
                borderColor: "rgba(168, 85, 247, 0.3)",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: "#A855F7",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#A855F7",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Shield size={36} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_700Bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Smart Safety Zones
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_500Medium",
                  color: "#CBD5E1",
                  lineHeight: 22,
                }}
              >
                Dynamic hunting zones that move with hunters and alert nearby
                adventurers automatically.
              </Text>
            </View>

            {/* Card 3 - Vibrant Cyan */}
            <View
              style={{
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 2,
                borderColor: "rgba(6, 182, 212, 0.3)",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: "#06B6D4",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#06B6D4",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Radio size={36} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_700Bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Emergency SOS
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_500Medium",
                  color: "#CBD5E1",
                  lineHeight: 22,
                }}
              >
                Automatic alerts to your emergency contacts when you're overdue.
                Stay connected, stay safe.
              </Text>
            </View>

            {/* Card 4 - Vibrant Green */}
            <View
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 2,
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: "#22C55E",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#22C55E",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Trees size={36} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_700Bold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                Offline Ready
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_500Medium",
                  color: "#CBD5E1",
                  lineHeight: 22,
                }}
              >
                Keep tracking even without signal. Your location syncs when
                you're back online.
              </Text>
            </View>
          </View>

          {/* Giant CTA Button */}
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: "#10B981",
              borderRadius: 24,
              paddingVertical: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 12,
              borderWidth: 3,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            onPress={handleStartAdventure}
            activeOpacity={0.85}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Montserrat_800ExtraBold",
                color: "#FFFFFF",
                marginRight: 12,
                letterSpacing: 0.5,
              }}
            >
              Start Your Adventure
            </Text>
            <ArrowRight size={28} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>

          {/* Tagline */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 32,
              gap: 8,
            }}
          >
            <MapPin size={20} color="#10B981" strokeWidth={2.5} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: "#94A3B8",
                letterSpacing: 1,
              }}
            >
              Explore Safely. Track Smartly.
            </Text>
            <MapPin size={20} color="#10B981" strokeWidth={2.5} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
