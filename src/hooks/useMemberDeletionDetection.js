import { useEffect } from "react";
import { useRouter } from "expo-router";

export function useMemberDeletionDetection(
  currentMemberId,
  currentMemberData,
  membersData,
  membersLoading,
  memberSetTimeRef,
  setCurrentMemberId,
  setSecondsAgo,
  setMyGeofenceId,
) {
  const router = useRouter();

  // Detect if current member was deleted (e.g., via reset)
  // CRITICAL: Only check AFTER initial load AND after grace period to avoid false positives
  useEffect(() => {
    // Skip check during initial loading
    if (membersLoading) {
      console.log(
        "⏳ TRACKING: Members still loading, skipping deletion check",
      );
      return;
    }

    // NEW: Skip check if we just set this member (within 3 second grace period)
    if (memberSetTimeRef.current) {
      const timeSinceSet = Date.now() - memberSetTimeRef.current;
      if (timeSinceSet < 3000) {
        console.log(
          "⏱️ TRACKING: Within grace period (" +
            timeSinceSet +
            "ms), skipping deletion check",
        );
        return;
      } else {
        console.log(
          "✅ TRACKING: Grace period expired, deletion detection now active",
        );
        memberSetTimeRef.current = null; // Clear the timestamp
      }
    }

    if (currentMemberId && membersData.length === 0) {
      console.log("⚠️ TRACKING: All members cleared - resetting tracking state");
      setCurrentMemberId(null);
      setSecondsAgo(0);
      setMyGeofenceId(null);
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    } else if (
      currentMemberId &&
      !currentMemberData &&
      membersData.length > 0
    ) {
      console.log("⚠️ TRACKING: Current member deleted - clearing state");
      setCurrentMemberId(null);
      setSecondsAgo(0);
      setMyGeofenceId(null);
    }
  }, [currentMemberId, currentMemberData, membersData.length, membersLoading]);
}
