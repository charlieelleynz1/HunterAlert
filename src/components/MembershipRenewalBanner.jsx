import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Platform } from "react-native";
import { AlertCircle, X } from "lucide-react-native";
import { useMembership } from "@/utils/useMembership";
import { WebView } from "react-native-webview";
import { router } from "expo-router";

export function MembershipRenewalBanner({ colors, onDismiss }) {
  const { needsRenewal, membershipEndDate, refetchMembership } =
    useMembership();
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [checkoutUrl, setCheckoutUrl] = React.useState(null);
  const flashAnim = useRef(new Animated.Value(1)).current;

  // Flashing animation
  useEffect(() => {
    if (needsRenewal) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [needsRenewal, flashAnim]);

  const handleRenew = async () => {
    try {
      const response = await fetch("/api/membership-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirectURL: `${process.env.EXPO_PUBLIC_APP_URL}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      setCheckoutUrl(url);
      setShowCheckout(true);
    } catch (error) {
      console.error("Failed to start renewal:", error);
    }
  };

  const handleWebViewClose = async () => {
    setShowCheckout(false);
    setCheckoutUrl(null);
    await refetchMembership();
  };

  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.startsWith(process.env.EXPO_PUBLIC_APP_URL)) {
      handleWebViewClose();
      return false;
    }
    return true;
  };

  if (!needsRenewal) {
    return null;
  }

  if (showCheckout && checkoutUrl) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              backgroundColor: colors.surface,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.primary,
              }}
            >
              Renew Membership
            </Text>
            <TouchableOpacity onPress={handleWebViewClose}>
              <X size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: checkoutUrl }}
            style={{ flex: 1 }}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        backgroundColor: "#FEF3C7",
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#F59E0B",
        opacity: flashAnim,
      }}
    >
      <AlertCircle size={24} color="#F59E0B" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#92400E",
            marginBottom: 2,
          }}
        >
          Membership Renewal Required
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: "#92400E",
          }}
        >
          Your annual membership has expired. Renew now to continue using the
          app.
        </Text>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#F59E0B",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          marginLeft: 8,
        }}
        onPress={handleRenew}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#FFFFFF",
          }}
        >
          Renew
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
