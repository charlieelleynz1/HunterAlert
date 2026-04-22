import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "@/utils/storage";

export function useGeofenceCreation(
  currentLocation,
  currentMemberId,
  isOnline,
  geofenceLoaded,
  myGeofenceId,
  setMyGeofenceId,
) {
  const queryClient = useQueryClient();
  const verifiedRef = useRef(false);
  const verifyingRef = useRef(false);

  // CRITICAL: Verify stored geofence still exists in the database
  // If the adventure was reset, the geofence may have been deleted but
  // the local storage still holds the old ID — this prevents re-creation
  useEffect(() => {
    if (
      !myGeofenceId ||
      !currentMemberId ||
      !isOnline ||
      verifiedRef.current ||
      verifyingRef.current
    )
      return;

    const verifyGeofence = async () => {
      verifyingRef.current = true;
      try {
        console.log(
          "🔍 Verifying stored geofence ID:",
          myGeofenceId,
          "still exists...",
        );
        const response = await fetch(`/api/geofences/${myGeofenceId}`);
        if (!response.ok || response.status === 404) {
          console.log(
            "⚠️ Stored geofence",
            myGeofenceId,
            "no longer exists! Clearing so a new one will be created.",
          );
          setMyGeofenceId(null);
          await storage.removeItem(`geofence_id_${currentMemberId}`);
        } else {
          console.log(
            "✅ Stored geofence",
            myGeofenceId,
            "verified - still exists",
          );
          verifiedRef.current = true;
        }
      } catch (error) {
        console.error("❌ Error verifying geofence:", error);
        // On error, clear so we can re-create
        setMyGeofenceId(null);
        await storage.removeItem(`geofence_id_${currentMemberId}`);
      } finally {
        verifyingRef.current = false;
      }
    };

    verifyGeofence();
  }, [myGeofenceId, currentMemberId, isOnline]);

  // Reset verification flag when member changes
  useEffect(() => {
    verifiedRef.current = false;
    verifyingRef.current = false;
  }, [currentMemberId]);

  // Create geofence mutation (only for initial creation)
  const createGeofenceMutation = useMutation({
    mutationFn: async ({ latitude, longitude }) => {
      console.log("🆕 Creating new geofence");
      const response = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: currentMemberId,
          name: "My Zone",
          latitude,
          longitude,
          radius: 150,
        }),
      });
      if (!response.ok) throw new Error("Failed to create geofence");
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.geofence && currentMemberId) {
        console.log("💾 Saving geofence ID to storage:", data.geofence.id);
        setMyGeofenceId(data.geofence.id);
        await storage.setItem(
          `geofence_id_${currentMemberId}`,
          String(data.geofence.id),
        );
      }
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
    },
  });

  // Create geofence on first location update (only if no geofence exists)
  useEffect(() => {
    if (!currentLocation || !currentMemberId || !isOnline || !geofenceLoaded) {
      return;
    }

    if (!myGeofenceId) {
      console.log("🎯 Creating initial geofence at current location");
      createGeofenceMutation.mutate({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  }, [
    currentLocation?.latitude,
    currentLocation?.longitude,
    currentMemberId,
    isOnline,
    geofenceLoaded,
    myGeofenceId,
  ]);

  return { createGeofenceMutation };
}
