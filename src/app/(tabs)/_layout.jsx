import { Tabs, Redirect } from "expo-router";
import { Map, AlertCircle, User } from "lucide-react-native";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";
import { View, ActivityIndicator } from "react-native";
import { storage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { AlarmAudioProvider } from "@/hooks/AlarmAudioContext";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isReady } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [checkingGuest, setCheckingGuest] = useState(true);

  useEffect(() => {
    const checkGuestMode = async () => {
      const guestMode = await storage.getItem("guestMode");
      setIsGuestMode(guestMode === "true");
      setCheckingGuest(false);
    };
    checkGuestMode();
  }, []);

  // Show loading while checking auth or guest mode
  if (!isReady || checkingGuest) {
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

  // Redirect to launch if not authenticated AND not in guest mode
  if (!isAuthenticated && !isGuestMode) {
    return <Redirect href="/auth/launch" />;
  }

  return (
    <AlarmAudioProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
            paddingBottom: 4,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Map color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="sos"
          options={{
            title: "SOS",
            tabBarIcon: ({ color }) => <AlertCircle color={color} size={28} />,
            tabBarActiveTintColor: "#DC2626",
            tabBarInactiveTintColor: "#EF4444",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
        {/* Hidden routes - accessible but not in tab bar */}
        <Tabs.Screen
          name="tracking"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </AlarmAudioProvider>
  );
}
