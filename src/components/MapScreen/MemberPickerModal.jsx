import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { X, Users as UsersIcon } from "lucide-react-native";

export function MemberPickerModal({
  visible,
  onClose,
  membersData,
  selectedMemberId,
  onSelectMember,
  addMemberMutation,
  savedUserName,
  colors,
}) {
  const [newMemberName, setNewMemberName] = useState("");

  // Pre-fill the saved user name when modal becomes visible
  useEffect(() => {
    if (visible && savedUserName && !newMemberName) {
      setNewMemberName(savedUserName);
    }
  }, [visible, savedUserName]);

  const handleAddNewMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    addMemberMutation.mutate(newMemberName.trim());
    setNewMemberName("");
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            width: "100%",
            maxWidth: 400,
            maxHeight: 500,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.text,
              }}
            >
              Who are you?
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: colors.secondary,
              marginBottom: 16,
              fontFamily: "Montserrat_500Medium",
            }}
          >
            Select your member identity to start sharing your location
          </Text>

          <ScrollView
            style={{ maxHeight: 250 }}
            showsVerticalScrollIndicator={false}
          >
            {membersData.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => onSelectMember(member.id)}
                style={{
                  backgroundColor:
                    selectedMemberId === member.id
                      ? "#10B981"
                      : colors.background,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor:
                      selectedMemberId === member.id
                        ? "#FFFFFF20"
                        : colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <UsersIcon
                    size={20}
                    color={
                      selectedMemberId === member.id ? "#fff" : colors.text
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Montserrat_600SemiBold",
                      color:
                        selectedMemberId === member.id ? "#fff" : colors.text,
                    }}
                  >
                    {member.user_name}
                  </Text>
                  {member.latitude && member.longitude && (
                    <Text
                      style={{
                        fontSize: 11,
                        color:
                          selectedMemberId === member.id
                            ? "#FFFFFFAA"
                            : colors.secondary,
                        marginTop: 2,
                        fontFamily: "Montserrat_500Medium",
                      }}
                    >
                      Last seen:{" "}
                      {member.last_location_update
                        ? new Date(
                            member.last_location_update,
                          ).toLocaleTimeString()
                        : "Never"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              marginTop: 16,
              paddingTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Not listed? Add yourself
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={newMemberName}
                onChangeText={setNewMemberName}
                placeholder="Enter your name"
                placeholderTextColor={colors.secondary}
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 8,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  fontFamily: "Montserrat_500Medium",
                }}
                editable={!addMemberMutation.isPending}
              />
              <TouchableOpacity
                onPress={handleAddNewMember}
                disabled={!newMemberName.trim() || addMemberMutation.isPending}
                style={{
                  backgroundColor:
                    !newMemberName.trim() || addMemberMutation.isPending
                      ? colors.border
                      : "#10B981",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                  }}
                >
                  {addMemberMutation.isPending ? "..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
