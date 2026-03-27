import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { X, MessageSquare, Smartphone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useAppTheme } from "../../utils/theme";

export function AddContactModal({
  visible,
  onClose,
  newContact,
  setNewContact,
  onAddContact,
  isAdding,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const methodOptions = [
    { value: "sms", label: "SMS", icon: Smartphone },
    { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { value: "both", label: "Both", icon: null },
  ];

  const selectedMethod = newContact.preferredMethod || "sms";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                }}
              >
                Add Emergency Contact
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                    marginBottom: 8,
                  }}
                >
                  Contact Name *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    fontFamily: "Montserrat_500Medium",
                    color: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="e.g., Mom, John Doe"
                  placeholderTextColor={colors.placeholder}
                  value={newContact.name}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, name: text })
                  }
                />
              </View>

              {/* Phone Input */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                    marginBottom: 8,
                  }}
                >
                  Phone Number *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    fontFamily: "Montserrat_500Medium",
                    color: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="e.g., +64 21 123 4567"
                  placeholderTextColor={colors.placeholder}
                  value={newContact.phone}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, phone: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              {/* Relationship Input */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                    marginBottom: 8,
                  }}
                >
                  Relationship (Optional)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    fontFamily: "Montserrat_500Medium",
                    color: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="e.g., Parent, Spouse, Friend"
                  placeholderTextColor={colors.placeholder}
                  value={newContact.relationship}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, relationship: text })
                  }
                />
              </View>

              {/* Preferred Contact Method */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                    marginBottom: 4,
                  }}
                >
                  Contact Method
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Montserrat_500Medium",
                    color: colors.secondary,
                    marginBottom: 12,
                  }}
                >
                  Falls back automatically if preferred method fails
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {methodOptions.map((option) => {
                    const isSelected = selectedMethod === option.value;
                    const IconComponent = option.icon;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 8,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? option.value === "whatsapp"
                              ? "#25D366"
                              : option.value === "both"
                                ? "#6366F1"
                                : "#3B82F6"
                            : colors.border,
                          backgroundColor: isSelected
                            ? option.value === "whatsapp"
                              ? "#25D36615"
                              : option.value === "both"
                                ? "#6366F115"
                                : "#3B82F615"
                            : colors.surface,
                        }}
                        onPress={() =>
                          setNewContact({
                            ...newContact,
                            preferredMethod: option.value,
                          })
                        }
                      >
                        {IconComponent && (
                          <IconComponent
                            size={16}
                            color={
                              isSelected
                                ? option.value === "whatsapp"
                                  ? "#25D366"
                                  : "#3B82F6"
                                : colors.secondary
                            }
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: isSelected
                              ? "Montserrat_600SemiBold"
                              : "Montserrat_500Medium",
                            color: isSelected
                              ? option.value === "whatsapp"
                                ? "#25D366"
                                : option.value === "both"
                                  ? "#6366F1"
                                  : "#3B82F6"
                              : colors.secondary,
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  onPress={onClose}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Montserrat_600SemiBold",
                      color: colors.secondary,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "#DC2626",
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  onPress={onAddContact}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Montserrat_600SemiBold",
                        color: "#FFFFFF",
                      }}
                    >
                      Add Contact
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingAnimatedView>
    </Modal>
  );
}
