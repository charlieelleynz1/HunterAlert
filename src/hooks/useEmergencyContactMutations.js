import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useEmergencyContactMutations() {
  const queryClient = useQueryClient();

  const addContactMutation = useMutation({
    mutationFn: async (contact) => {
      const response = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contact.name,
          phoneNumber: contact.phone,
          relationship: contact.relationship,
          preferredMethod: contact.preferredMethod || "sms",
        }),
      });
      if (!response.ok) throw new Error("Failed to add contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to add emergency contact");
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const response = await fetch(`/api/emergency-contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update emergency contact");
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId) => {
      const response = await fetch(`/api/emergency-contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete emergency contact");
    },
  });

  return {
    addContactMutation,
    updateContactMutation,
    deleteContactMutation,
  };
}
