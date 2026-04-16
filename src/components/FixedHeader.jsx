import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { useAppTheme } from "../utils/theme";

export default function FixedHeader({
  title,
  subtitle,
  showBorder = false,
  leftComponent,
  rightComponent,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: subtitle ? 20 : 10,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: colors.border,
        }}
      >
        {leftComponent && (
          <View style={{ marginRight: 12 }}>{leftComponent}</View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                marginTop: 4,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightComponent && rightComponent}
      </View>
    </View>
  );
}
