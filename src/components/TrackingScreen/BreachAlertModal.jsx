import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DISMISS_DELAY_SECONDS = 4;

/**
 * Full-screen breach alert modal.
 * Shows the warning immediately but delays the OK button by a few seconds
 * so the member has time to hear the alarm before they can dismiss it.
 */
export function BreachAlertModal({
  visible,
  title,
  message,
  isHunting,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState(DISMISS_DELAY_SECONDS);
  const canDismiss = countdown <= 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Reset countdown every time the modal becomes visible
  useEffect(() => {
    if (!visible) {
      setCountdown(DISMISS_DELAY_SECONDS);
      return;
    }

    setCountdown(DISMISS_DELAY_SECONDS);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  // Pulsing animation for the icon while countdown is active
  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [visible]);

  if (!visible) return null;

  const bgColor = isHunting ? "#7F1D1D" : "#1E3A5F";
  const accentColor = isHunting ? "#EF4444" : "#3B82F6";
  const iconEmoji = isHunting ? "🚨" : "🔔";
  const borderColor = isHunting ? "#DC2626" : "#2563EB";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            backgroundColor: bgColor,
            borderRadius: 20,
            padding: 28,
            width: "100%",
            maxWidth: 340,
            alignItems: "center",
            borderWidth: 2,
            borderColor: borderColor,
          }}
        >
          {/* Pulsing icon */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 56 }}>{iconEmoji}</Text>
          </Animated.View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Montserrat_600SemiBold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: "#E5E7EB",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>

          {/* Dismiss button — disabled during countdown */}
          {canDismiss ? (
            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={0.7}
              style={{
                backgroundColor: accentColor,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 48,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                OK — Stop Alarm
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 48,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_500Medium",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Listen to the alarm... ({countdown}s)
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
