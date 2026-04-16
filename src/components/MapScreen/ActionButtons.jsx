import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Plus,
  Trash2,
  Play,
  MapPin,
  AlertTriangle,
  Square,
} from "lucide-react-native";
import AdBanner from "@/components/AdBanner";

export function ActionButtons({
  insets,
  colors,
  isActivityRunning,
  geofenceMode,
  onStartStopActivity,
  onAddRemoveGeofence,
  onSOS,
}) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom - 18, 0),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View style={{ marginBottom: 12 }}>
        <AdBanner />
      </View>

      <View style={{ flexDirection: "column", gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10, height: 64 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: isActivityRunning ? "#EF4444" : "#22C55E",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={onStartStopActivity}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              {isActivityRunning ? (
                <Square size={18} color="#FFFFFF" />
              ) : (
                <Play size={18} color="#FFFFFF" />
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {isActivityRunning ? "Stop Activity" : "Start Activity"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor:
                geofenceMode === "remove"
                  ? "#EF4444"
                  : geofenceMode === "add"
                    ? "#22C55E"
                    : "#3B82F6",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={onAddRemoveGeofence}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              {geofenceMode === "remove" ? (
                <Trash2 size={18} color="#FFFFFF" />
              ) : geofenceMode === "add" ? (
                <Plus size={18} color="#FFFFFF" />
              ) : (
                <MapPin size={18} color="#FFFFFF" />
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {geofenceMode === "remove"
                ? "Cancel Remove"
                : geofenceMode === "add"
                  ? "Cancel Add"
                  : "Geofence"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SOS Button - Full Width */}
        <TouchableOpacity
          style={{
            backgroundColor: "#EF4444",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            height: 64,
          }}
          onPress={onSOS}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <AlertTriangle size={18} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Montserrat_600SemiBold",
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            SOS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
