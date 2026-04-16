import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";

export function ExpectedEndTimeModal({ visible, onClose, onConfirm, colors }) {
  const [selectedHours, setSelectedHours] = useState(2);

  const handleConfirm = () => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + selectedHours);
    onConfirm(endTime); // Pass Date object, not ISO string
  };

  const timeOptions = [
    { label: "30 minutes", hours: 0.5 },
    { label: "1 hour", hours: 1 },
    { label: "2 hours", hours: 2 },
    { label: "3 hours", hours: 3 },
    { label: "4 hours", hours: 4 },
    { label: "6 hours", hours: 6 },
    { label: "8 hours", hours: 8 },
    { label: "12 hours", hours: 12 },
  ];

  const getEndTime = (hours) => {
    const time = new Date();
    time.setHours(time.getHours() + Math.floor(hours));
    time.setMinutes(time.getMinutes() + (hours % 1) * 60);
    return time;
  };

  const getOverdueTime = (hours) => {
    const time = getEndTime(hours);
    time.setHours(time.getHours() + 1);
    return time;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Expected End Time
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.secondaryText,
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              When do you expect to finish? You'll get a warning if overdue by 1
              hour, and an automatic SOS 5 minutes later.
            </Text>

            {/* Time Options */}
            <View style={{ gap: 10, marginBottom: 20 }}>
              {timeOptions.map((option) => (
                <TouchableOpacity
                  key={option.hours}
                  onPress={() => setSelectedHours(option.hours)}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    backgroundColor:
                      selectedHours === option.hours
                        ? colors.primary
                        : colors.cardBackground,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedHours === option.hours
                        ? colors.primary
                        : "transparent",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color:
                          selectedHours === option.hours ? "#fff" : colors.text,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color:
                          selectedHours === option.hours
                            ? "rgba(255,255,255,0.8)"
                            : colors.secondaryText,
                      }}
                    >
                      {getEndTime(option.hours).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Box */}
            <View
              style={{
                backgroundColor: colors.cardBackground,
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.secondaryText,
                  marginBottom: 8,
                }}
              >
                ⏰ Expected finish:{" "}
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  {getEndTime(selectedHours).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.secondaryText,
                }}
              >
                ⚠️ Overdue warning:{" "}
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  {getOverdueTime(selectedHours).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Text>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Start Activity
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              onPress={() => onConfirm(null)}
              style={{
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.secondaryText,
                  fontSize: 14,
                }}
              >
                Skip (no overdue check)
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
