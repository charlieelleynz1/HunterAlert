import { useState, useEffect } from "react";
import {
  getGuestSessionCount,
  incrementGuestSessionCount,
  hasReachedGuestLimit,
} from "@/utils/storage";

export function useGuestSession(isGuest) {
  const [guestSessionCount, setGuestSessionCount] = useState(0);
  const [guestLimitReached, setGuestLimitReached] = useState(false);

  // Check guest session count on mount
  useEffect(() => {
    const checkGuestLimit = async () => {
      if (isGuest) {
        const count = await getGuestSessionCount();
        setGuestSessionCount(count);
        setGuestLimitReached(count >= 3);
      } else {
        setGuestSessionCount(0);
        setGuestLimitReached(false);
      }
    };
    checkGuestLimit();
  }, [isGuest]);

  const incrementSession = async () => {
    const newCount = await incrementGuestSessionCount();
    setGuestSessionCount(newCount);
    return newCount;
  };

  const checkLimit = async () => {
    return await hasReachedGuestLimit();
  };

  return {
    guestSessionCount,
    guestLimitReached,
    incrementSession,
    checkLimit,
  };
}
