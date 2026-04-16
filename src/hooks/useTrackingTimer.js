import { useEffect } from "react";

export function useTrackingTimer(
  lastUpdateTime,
  currentMemberId,
  setSecondsAgo,
) {
  // Update "seconds ago" counter every second
  useEffect(() => {
    if (!lastUpdateTime || !currentMemberId) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdateTime) / 1000);
      setSecondsAgo(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime, currentMemberId]);
}
