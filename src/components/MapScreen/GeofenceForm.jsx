import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";

export function GeofenceForm({
  visible,
  onClose,
  onSubmit,
  isPending,
  colors,
  members = [],
}) {
  const [geofenceName, setGeofenceName] = useState("");
  const [geofenceRadius, setGeofenceRadius] = useState("150");
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleSubmit = () => {
    if (!geofenceName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    const radius = parseFloat(geofenceRadius);
    if (isNaN(radius) || radius < 150) {
      Alert.alert("Error", "Radius must be at least 150 meters");
      return;
    }

    onSubmit({
      name: geofenceName.trim(),
      radius,
      member_id: selectedMemberId,
    });
    setGeofenceName("");
    setGeofenceRadius("150");
    setSelectedMemberId(null);
  };

  const handleClose = () => {
    setGeofenceName("");
    setGeofenceRadius("150");
    setSelectedMemberId(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxHeight: 500,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.text,
          }}
        >
          New Geofence
        </Text>
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ maxHeight: 350 }}>
        <TextInput
          value={geofenceName}
          onChangeText={setGeofenceName}
          placeholder="Geofence name"
          placeholderTextColor={colors.secondary}
          style={{
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          editable={!isPending}
        />

        <TextInput
          value={geofenceRadius}
          onChangeText={setGeofenceRadius}
          placeholder="Radius (minimum 150m)"
          placeholderTextColor={colors.secondary}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          editable={!isPending}
        />

        {members.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                marginBottom: 8,
              }}
            >
              Geofence Type
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedMemberId(null)}
                disabled={isPending}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor:
                    selectedMemberId === null
                      ? colors.primary
                      : colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selectedMemberId === null ? "#fff" : colors.text,
                    fontFamily: "Montserrat_500Medium",
                  }}
                >
                  Fixed Position
                </Text>
              </TouchableOpacity>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => setSelectedMemberId(member.id)}
                  disabled={isPending}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor:
                      selectedMemberId === member.id
                        ? "#F59E0B"
                        : colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color:
                        selectedMemberId === member.id ? "#fff" : colors.text,
                      fontFamily: "Montserrat_500Medium",
                    }}
                  >
                    Follow {member.user_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!geofenceName.trim() || isPending}
        style={{
          backgroundColor:
            !geofenceName.trim() || isPending ? colors.border : colors.primary,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontFamily: "Montserrat_600SemiBold",
          }}
        >
          {isPending ? "Creating..." : "Create Geofence"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
