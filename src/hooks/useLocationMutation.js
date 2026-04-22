import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sosEmergency } from "@/utils/sosEmergency";

export function useLocationMutation(selectedGroup, setIsOnline) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, latitude, longitude }) => {
      // Check SOS priority - abort location updates if SOS is active
      sosEmergency.checkAndAbort("Location update");

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, latitude, longitude }),
      });
      if (!response.ok) throw new Error("Failed to update location");
      setIsOnline(true);
      const data = await response.json();
      // Return the full response including geofence status
      return data;
    },
    onSuccess: (data) => {
      if (sosEmergency.isActive()) {
        console.log("Location updated but SOS active - skipping cache updates");
        return data;
      }
      queryClient.invalidateQueries({
        queryKey: ["members", selectedGroup?.id],
      });
      // Return geofence status for the caller to use
      return data;
    },
    onError: (error) => {
      if (error.code === "SOS_ABORT") {
        console.log("Location update aborted for SOS emergency");
        return;
      }
      setIsOnline(false);
      console.log("Location update failed - will queue for retry");
    },
    retry: 2,
    retryDelay: 3000,
  });
}
