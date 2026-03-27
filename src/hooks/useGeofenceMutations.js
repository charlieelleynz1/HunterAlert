import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { sosEmergency } from "@/utils/sosEmergency";

export function useGeofenceMutations(selectedGroup, setIsOnline) {
  const queryClient = useQueryClient();

  const createGeofenceMutation = useMutation({
    mutationFn: async (geofence) => {
      // Check SOS priority - abort if active
      sosEmergency.checkAndAbort("Create geofence");

      const response = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geofence),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create geofence");
      }

      setIsOnline(true);
      return response.json();
    },
    onSuccess: () => {
      if (sosEmergency.isActive()) {
        console.log("Geofence created but SOS active - skipping UI updates");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["geofences", selectedGroup?.id],
      });
      Alert.alert("Success!", "Geofence created successfully");
    },
    onError: (error) => {
      if (error.code === "SOS_ABORT") {
        console.log("Geofence creation aborted for SOS emergency");
        return;
      }
      console.error("Geofence creation error:", error);
      setIsOnline(false);
      Alert.alert(
        "Failed to Create Geofence",
        error.message || "Check your connection and try again.",
      );
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 15000),
  });

  return { createGeofenceMutation };
}
