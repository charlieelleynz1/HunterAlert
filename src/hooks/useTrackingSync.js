import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to coordinate tracking timing across all active members
 * Only members with active adventures participate
 * Auto-resyncs when network reconnects
 */
export function useTrackingSync(isActiveAdventurer, isOnline) {
  const previousSyncState = useRef(false);
  const previousOnlineState = useRef(isOnline);

  // Poll tracking sync status every 5 seconds to coordinate timing
  const { data: syncData, refetch } = useQuery({
    queryKey: ["tracking-sync"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tracking-sync`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tracking sync status");
      }
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: isActiveAdventurer && isOnline, // Only poll if actively tracking AND online
  });

  const isSyncing = syncData?.isSyncing || false;
  const activeTrackers = syncData?.activeTrackers || 0;
  const totalMembers = syncData?.totalMembers || 0;
  const syncWindow = syncData?.syncWindow || 0;

  // Auto-resync when coming back online
  useEffect(() => {
    if (!previousOnlineState.current && isOnline && isActiveAdventurer) {
      console.log("🔄 Network reconnected - resyncing tracking state");
      refetch();
    }
    previousOnlineState.current = isOnline;
  }, [isOnline, isActiveAdventurer, refetch]);

  // Log when sync state changes
  useEffect(() => {
    if (previousSyncState.current !== isSyncing) {
      console.log("📡 TRACKING SYNC STATE CHANGED:", {
        from: previousSyncState.current,
        to: isSyncing,
        activeTrackers,
        totalMembers,
      });

      previousSyncState.current = isSyncing;
    }
  }, [isSyncing, activeTrackers, totalMembers]);

  return {
    // Sync state
    isSyncing, // Are there any active trackers?
    activeTrackers, // How many members are actively tracking?
    totalMembers, // Total members in the system
    syncWindow, // Current sync window for coordinated updates

    // Display info
    shouldShowSync: isActiveAdventurer && isSyncing, // Show sync indicator if this member is being tracked/compared
  };
}
