import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Linking,
  Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "../utils/theme";
import { ExternalLink, Flag } from "lucide-react-native";

export default function AdBanner() {
  const { colors } = useAppTheme();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [trackedImpressions, setTrackedImpressions] = useState(new Set());

  const { data: adsData } = useQuery({
    queryKey: ["advertisements"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/ads");
        if (!response.ok) throw new Error("Failed to fetch ads");
        const data = await response.json();
        return data.ads || [];
      } catch (error) {
        console.error("Error fetching ads:", error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  // Track impression when ad becomes visible
  useEffect(() => {
    if (!adsData || adsData.length === 0) return;

    const currentAd = adsData[currentAdIndex];
    if (!currentAd || trackedImpressions.has(currentAd.id)) return;

    // Track impression (non-blocking, fire-and-forget)
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad_id: currentAd.id,
        event_type: "impression",
      }),
    }).catch(() => {}); // Silently fail if tracking fails

    setTrackedImpressions((prev) => new Set([...prev, currentAd.id]));
  }, [currentAdIndex, adsData]);

  // Rotate ads every 10 seconds
  useEffect(() => {
    if (!adsData || adsData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adsData.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [adsData]);

  if (!adsData || adsData.length === 0) {
    return null;
  }

  const currentAd = adsData[currentAdIndex];

  const handleAdPress = () => {
    if (currentAd.link_url) {
      // Track click (non-blocking, fire-and-forget)
      fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: currentAd.id,
          event_type: "click",
        }),
      }).catch(() => {}); // Silently fail if tracking fails

      Linking.openURL(currentAd.link_url).catch((err) =>
        console.error("Failed to open URL:", err),
      );
    }
  };

  const handleReportAd = () => {
    Alert.alert(
      "Report Advertisement",
      `Report "${currentAd.title}" for:\n\n• Inappropriate content\n• Misleading claims\n• Offensive material\n• Other policy violations\n\nWould you like to report this ad?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Thank You",
              "Your report has been submitted. We'll review this ad and take appropriate action if needed.",
            );
            // In production, this would send a report to the backend
            console.log(`Ad reported: ${currentAd.id} - ${currentAd.title}`);
          },
        },
      ],
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleAdPress}
        activeOpacity={currentAd.link_url ? 0.7 : 1}
        disabled={!currentAd.link_url}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: currentAd.image_url }}
            style={{
              width: "100%",
              height: 80,
              resizeMode: "cover",
            }}
          />

          {/* Sponsor Badge */}
          <View
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 10,
                fontFamily: "Montserrat_600SemiBold",
                textTransform: "uppercase",
              }}
            >
              Sponsored
            </Text>
          </View>

          {/* Link Indicator */}
          {currentAd.link_url && (
            <View
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                backgroundColor: "rgba(59, 130, 246, 0.9)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontFamily: "Montserrat_600SemiBold",
                }}
              >
                Tap to Learn More
              </Text>
              <ExternalLink size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Ad Title */}
        <View style={{ padding: 8 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {currentAd.title}
          </Text>
        </View>

        {/* Rotation Indicator */}
        {adsData.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 4,
              paddingBottom: 8,
            }}
          >
            {adsData.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    index === currentAdIndex ? colors.blue : colors.border,
                }}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Report Ad Button */}
      <TouchableOpacity
        onPress={handleReportAd}
        style={{
          marginTop: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Flag size={12} color={colors.secondary} style={{ marginRight: 6 }} />
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
          }}
        >
          Report Ad
        </Text>
      </TouchableOpacity>
    </View>
  );
}
