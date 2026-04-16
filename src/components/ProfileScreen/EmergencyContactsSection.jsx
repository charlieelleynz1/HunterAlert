import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
import {
  Phone,
  Plus,
  Trash2,
  WifiOff,
  RefreshCw,
  MessageSquare,
  Smartphone,
} from "lucide-react-native";
import { useAppTheme } from "../../utils/theme";

export function EmergencyContactsSection({
  contactsData,
  contactsError,
  refetchContacts,
  isRefetchingContacts,
  onAddContact,
  onDeleteContact,
}) {
  const { colors } = useAppTheme();

  return (
    <>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Montserrat_600SemiBold",
          color: colors.primary,
          marginBottom: 12,
        }}
      >
        Emergency Contacts
      </Text>

      {contactsError && (
        <View
          style={{
            backgroundColor: "#FEE2E2",
            padding: 12,
            marginBottom: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <WifiOff size={20} color="#DC2626" />
            <Text
              style={{
                marginLeft: 8,
                color: "#DC2626",
                flex: 1,
                fontSize: 12,
              }}
            >
              Unable to load contacts
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetchContacts()}
            disabled={isRefetchingContacts}
            style={{
              backgroundColor: "#DC2626",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <RefreshCw size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {contactsData?.contacts && contactsData.contacts.length > 0 ? (
        contactsData.contacts.map((contact) => {
          const method = contact.preferred_method || "sms";
          const methodLabel =
            method === "whatsapp"
              ? "WhatsApp"
              : method === "both"
                ? "SMS + WhatsApp"
                : "SMS";
          const methodColor =
            method === "whatsapp"
              ? "#25D366"
              : method === "both"
                ? "#6366F1"
                : "#3B82F6";
          return (
            <View
              key={contact.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#DC2626" + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Phone size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Montserrat_600SemiBold",
                      color: colors.primary,
                    }}
                  >
                    {contact.contact_name}
                  </Text>
                  {contact.relationship && (
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Montserrat_500Medium",
                        color: colors.secondary,
                      }}
                    >
                      {contact.relationship}
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    {method === "whatsapp" || method === "both" ? (
                      <MessageSquare
                        size={12}
                        color={methodColor}
                        style={{ marginRight: 4 }}
                      />
                    ) : (
                      <Smartphone
                        size={12}
                        color={methodColor}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Montserrat_500Medium",
                        color: methodColor,
                      }}
                    >
                      {methodLabel}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#FEE2E2",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Delete Contact",
                      `Remove ${contact.contact_name} from emergency contacts?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => onDeleteContact(contact.id),
                        },
                      ],
                    );
                  }}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.blueLight,
                  borderRadius: 10,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  Linking.openURL(`tel:${contact.phone_number}`);
                }}
              >
                <Phone
                  size={16}
                  color={colors.blue}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.blue,
                  }}
                >
                  {contact.phone_number}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.surfaceVariant,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Phone size={24} color={colors.placeholder} />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            No Emergency Contacts
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
            }}
          >
            Add contacts to notify in case of emergency
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: "#DC2626",
          borderRadius: 12,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
        onPress={onAddContact}
      >
        <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat_600SemiBold",
            color: "#FFFFFF",
          }}
        >
          Add Emergency Contact
        </Text>
      </TouchableOpacity>
    </>
  );
}
