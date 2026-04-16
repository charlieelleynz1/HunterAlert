import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useMembership } from "@/utils/useMembership";
import { WebView } from "react-native-webview";
import useUser from "@/utils/auth/useUser";

export default function MembershipStatusScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { data: user } = useUser();
  const {
    status,
    membershipEndDate,
    needsRenewal,
    loading,
    refetchMembership,
  } = useMembership();
  const [checkoutUrl, setCheckoutUrl] = React.useState(null);
  const [showCheckout, setShowCheckout] = React.useState(false);

  const [fontsLoaded, error] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const handleRenew = async () => {
    try {
      const response = await fetch("/api/membership-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
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

  if (!fontsLoaded && !error) {
    return null;
  }

  // Show payment WebView if checkout URL is available
  if (showCheckout && checkoutUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 12,
            backgroundColor: colors.surface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            Renew Membership
          </Text>
          <TouchableOpacity onPress={handleWebViewClose}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.blue,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        />
      </View>
    );
  }

  const isActive = status === "active";
  const endDate = membershipEndDate ? new Date(membershipEndDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
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
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Montserrat_700Bold",
              color: colors.primary,
              marginBottom: 12,
            }}
          >
            Membership Status
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 24,
            }}
          >
            Manage your annual membership
          </Text>
        </View>

        {loading ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 40,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={colors.blue} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                marginTop: 16,
              }}
            >
              Loading membership details...
            </Text>
          </View>
        ) : (
          <>
            {/* Status Card */}
            <View
              style={{
                backgroundColor:
                  isActive && !needsRenewal
                    ? "#10B981"
                    : needsRenewal
                      ? "#F59E0B"
                      : "#EF4444",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                {isActive && !needsRenewal ? (
                  <CheckCircle
                    size={32}
                    color="#FFFFFF"
                    style={{ marginRight: 12 }}
                  />
                ) : needsRenewal ? (
                  <AlertCircle
                    size={32}
                    color="#FFFFFF"
                    style={{ marginRight: 12 }}
                  />
                ) : (
                  <XCircle
                    size={32}
                    color="#FFFFFF"
                    style={{ marginRight: 12 }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Montserrat_700Bold",
                    color: "#FFFFFF",
                    flex: 1,
                  }}
                >
                  {isActive && !needsRenewal
                    ? "Active Membership"
                    : needsRenewal
                      ? "Renewal Required"
                      : "No Active Membership"}
                </Text>
              </View>

              {isActive && !needsRenewal && daysRemaining !== null && (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} days remaining`
                    : "Expires today"}
                </Text>
              )}

              {needsRenewal && (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  Your membership has expired
                </Text>
              )}

              {!isActive && !needsRenewal && (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  Subscribe to access all features
                </Text>
              )}
            </View>

            {/* Membership Details */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat_700Bold",
                  color: colors.primary,
                  marginBottom: 20,
                }}
              >
                Membership Details
              </Text>

              {/* Plan Type */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <CreditCard
                  size={20}
                  color={colors.secondary}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Montserrat_500Medium",
                      color: colors.secondary,
                      marginBottom: 4,
                    }}
                  >
                    Plan
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Montserrat_600SemiBold",
                      color: colors.primary,
                    }}
                  >
                    Annual Membership
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Montserrat_700Bold",
                    color: colors.blue,
                  }}
                >
                  $25 NZD
                </Text>
              </View>

              {/* Renewal Date */}
              {endDate && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Calendar
                    size={20}
                    color={colors.secondary}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Montserrat_500Medium",
                        color: colors.secondary,
                        marginBottom: 4,
                      }}
                    >
                      {needsRenewal ? "Expired On" : "Renews On"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Montserrat_600SemiBold",
                        color: colors.primary,
                      }}
                    >
                      {endDate.toLocaleDateString("en-NZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Renew/Subscribe Button */}
            {(needsRenewal || !isActive) && (
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
                }}
                onPress={handleRenew}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  {needsRenewal ? "Renew Membership" : "Subscribe Now"} - $25
                  NZD
                </Text>
              </TouchableOpacity>
            )}

            {/* Benefits Section */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat_700Bold",
                  color: colors.primary,
                  marginBottom: 16,
                }}
              >
                Membership Benefits
              </Text>

              {[
                "Track unlimited group members",
                "Real-time GPS location updates",
                "Geofence breach alerts",
                "Offline mode with auto-sync",
                "SOS emergency features",
                "Priority support",
              ].map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle
                    size={20}
                    color="#10B981"
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Montserrat_500Medium",
                      color: colors.primary,
                      flex: 1,
                    }}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
