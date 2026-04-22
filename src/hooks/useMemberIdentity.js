import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { storage } from "@/utils/storage";
import { useDeviceIdentity } from "./useDeviceIdentity";

export function useMemberIdentity(selectedGroup) {
  const queryClient = useQueryClient();
  const { deviceId, userName: savedUserName } = useDeviceIdentity();
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  useEffect(() => {
    (async () => {
      if (selectedGroup && deviceId) {
        // Try to find this device's member ID in the current group
        try {
          const response = await fetch(
            `/api/groups/${selectedGroup.id}/members`,
          );
          if (response.ok) {
            const { members } = await response.json();
            const myMember = members.find((m) => m.device_id === deviceId);
            if (myMember) {
              setSelectedMemberId(myMember.id);
              // Update stored member ID to match server
              await storage.setItem(
                `member_identity_${selectedGroup.id}`,
                myMember.id.toString(),
              );
              return;
            }
          }
        } catch (error) {
          console.error("Error finding member:", error);
        }

        // Fallback to stored member ID if device matching fails
        const storedMemberId = await storage.getItem(
          `member_identity_${selectedGroup.id}`,
        );
        if (storedMemberId) {
          // Validate that this member still exists
          try {
            const response = await fetch(`/api/members/${storedMemberId}`);
            if (response.ok) {
              setSelectedMemberId(parseInt(storedMemberId));
            } else {
              // Member doesn't exist anymore, clear it
              console.log("Stored member ID is invalid, clearing...");
              await storage.removeItem(`member_identity_${selectedGroup.id}`);
              setSelectedMemberId(null);
            }
          } catch (error) {
            console.error("Error validating member ID:", error);
            // Network error, keep the stored ID for now
            setSelectedMemberId(parseInt(storedMemberId));
          }
        }
      }
    })();
  }, [selectedGroup, deviceId]);

  const handleSelectMember = async (memberId) => {
    setSelectedMemberId(memberId);
    if (selectedGroup) {
      await storage.setItem(
        `member_identity_${selectedGroup.id}`,
        memberId.toString(),
      );
    }
  };

  const addMemberMutation = useMutation({
    mutationFn: async (userName) => {
      const response = await fetch(`/api/groups/${selectedGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, deviceId }),
      });
      if (!response.ok) throw new Error("Failed to add member");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["members", selectedGroup?.id],
      });
      handleSelectMember(data.member.id);
      Alert.alert("Success!", "You've been added to the group");
    },
    onError: () => {
      Alert.alert("Error", "Failed to add member. Please try again.");
    },
  });

  return {
    selectedMemberId,
    handleSelectMember,
    addMemberMutation,
    savedUserName,
    deviceId,
  };
}
