import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { useDeviceIdentity } from "./useDeviceIdentity";

export function useGeofenceDeletion(selectedGroup, setIsOnline) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  const { deviceId } = useDeviceIdentity();

  const deleteAllMyGeofencesMutation = useMutation({
    mutationFn: async ({ geofenceIds, memberId }) => {
      const errors = [];

      if (geofenceIds && geofenceIds.length > 0) {
        try {
          await Promise.all(
            geofenceIds.map((id) => {
              // Add deviceId to DELETE request if not authenticated
              const url = currentUser
                ? `/api/geofences/${id}`
                : `/api/geofences/${id}?deviceId=${deviceId}`;
              return fetch(url, {
                method: "DELETE",
              }).then((res) => {
                if (!res.ok) throw new Error("Failed to delete geofence");
                return res.json();
              });
            }),
          );
        } catch (error) {
          console.error("Error deleting geofences:", error);
          errors.push("geofences");
        }
      }

      if (memberId) {
        try {
          // Clear location by updating member
          const url = currentUser
            ? `/api/members/${memberId}`
            : `/api/members/${memberId}?deviceId=${deviceId}`;
          const response = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: null,
              longitude: null,
            }),
          });
          if (!response.ok) throw new Error("Failed to clear location data");
        } catch (error) {
          console.error("Error clearing location:", error);
          errors.push("location");
        }
      }

      if (errors.length > 0) {
        throw new Error(`Failed to clear: ${errors.join(", ")}`);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["geofences", selectedGroup?.id],
        }),
        queryClient.refetchQueries({
          queryKey: ["members", selectedGroup?.id],
        }),
      ]);
      Alert.alert(
        "Success",
        "All your geofences and location have been cleared!",
      );
    },
    onError: (error) => {
      console.error("Error deleting geofences:", error);
      Alert.alert("Error", error.message || "Failed to delete some geofences");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async ({ geofencesToDelete, memberId }) => {
      const errors = [];

      if (geofencesToDelete && geofencesToDelete.length > 0) {
        try {
          await Promise.all(
            geofencesToDelete.map((g) => {
              // Add deviceId to DELETE request if not authenticated
              const url = currentUser
                ? `/api/geofences/${g.id}`
                : `/api/geofences/${g.id}?deviceId=${deviceId}`;
              return fetch(url, {
                method: "DELETE",
              }).then((res) => {
                if (!res.ok)
                  throw new Error(`Failed to delete geofence ${g.name}`);
                return res.json();
              });
            }),
          );
        } catch (error) {
          console.error("Error deleting geofences:", error);
          errors.push("geofences");
        }
      }

      if (memberId) {
        try {
          // Clear location by updating member
          const url = currentUser
            ? `/api/members/${memberId}`
            : `/api/members/${memberId}?deviceId=${deviceId}`;
          const response = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: null,
              longitude: null,
            }),
          });
          if (!response.ok) throw new Error("Failed to clear location data");
        } catch (error) {
          console.error("Error clearing location:", error);
          errors.push("location");
        }
      }

      if (errors.length > 0) {
        throw new Error(`Failed to clear: ${errors.join(", ")}`);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["geofences", selectedGroup?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["members", selectedGroup?.id],
        }),
      ]);
      Alert.alert(
        "Success",
        "All your activities and geofences have been cleared!",
      );
    },
    onError: (error) => {
      console.error("Error clearing data:", error);
      Alert.alert("Error", error.message || "Failed to clear some data");
    },
  });

  return {
    deleteAllMyGeofencesMutation,
    clearAllMutation,
  };
}
