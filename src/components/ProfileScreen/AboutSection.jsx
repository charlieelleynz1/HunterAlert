import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Lock, Info, BookOpen } from "lucide-react-native";
import * as Linking from "expo-linking";
import { useAppTheme } from "../../utils/theme";

export function AboutSection() {
  const { colors } = useAppTheme();

  const openUserGuide = async () => {
    const guideUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/guide`;
    const canOpen = await Linking.canOpenURL(guideUrl);

    if (canOpen) {
      await Linking.openURL(guideUrl);
    } else {
      Alert.alert(
        "Unable to Open Guide",
        "Please visit the guide at your app's website.",
      );
    }
  };

  const openPrivacyPolicy = async () => {
    const privacyUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/privacy-policy`;
    const canOpen = await Linking.canOpenURL(privacyUrl);

    if (canOpen) {
      await Linking.openURL(privacyUrl);
    } else {
      Alert.alert(
        "Unable to Open Privacy Policy",
        "Please visit the privacy policy at your app's website.",
      );
    }
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
        About
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={openPrivacyPolicy}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.purple + "40",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Lock size={20} color={colors.purple} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            Privacy Policy
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 2,
            }}
          >
            Learn how we protect your data
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={openUserGuide}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.blue + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <BookOpen size={20} color={colors.blue} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            User Guide
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 2,
            }}
          >
            Learn how to use the app
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => {
          Alert.alert(
            "About Geofencing App",
            "Version 1.0.0\n\nShare your location and set up geofences with your groups.",
          );
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.orange + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Info size={20} color={colors.orange} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            About
          </Text>
        </View>
      </TouchableOpacity>

      <View
        style={{
          marginTop: 32,
          padding: 16,
          backgroundColor: colors.blueLight,
          borderRadius: 16,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
            lineHeight: 18,
          }}
        >
          Location sharing works best when the app is running. Keep it open in
          the background for real-time updates.
        </Text>
      </View>
    </>
  );
}
