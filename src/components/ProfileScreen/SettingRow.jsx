import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppTheme } from "../../utils/theme";

export function SettingRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  color,
  showChevron = true,
  disabled = false,
}) {
  const { colors } = useAppTheme();

  const content = (
    <>
      {Icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: color + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Icon size={20} color={color} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.borderLight, true: color + "80" }}
          thumbColor={value ? color : colors.surfaceVariant}
          disabled={disabled}
        />
      )}

      {onPress && showChevron && (
        <ChevronRight size={20} color={colors.secondary} />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        }}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {content}
    </View>
  );
}
