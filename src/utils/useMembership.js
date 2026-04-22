import { useCallback, useEffect } from "react";
import { create } from "zustand";

const useMembershipStore = create((set, get) => ({
  status: null,
  membershipEndDate: null,
  needsRenewal: false,
  loading: true,

  checkMembership: async () => {
    if (get().loading === false) {
      return;
    }

    try {
      const response = await fetch("/api/membership-status", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to check membership status");
      }

      const data = await response.json();

      set({
        status: data.status,
        membershipEndDate: data.membershipEndDate,
        needsRenewal: data.needsRenewal,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking membership:", error);
      set({ loading: false });
    }
  },

  refetchMembership: async () => {
    set({ loading: true });

    try {
      const response = await fetch("/api/membership-status", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to check membership status");
      }

      const data = await response.json();

      set({
        status: data.status,
        membershipEndDate: data.membershipEndDate,
        needsRenewal: data.needsRenewal,
        loading: false,
      });
    } catch (error) {
      console.error("Error refetching membership:", error);
      set({ loading: false });
    }
  },
}));

export function useMembership() {
  const {
    status,
    membershipEndDate,
    needsRenewal,
    loading,
    checkMembership,
    refetchMembership,
  } = useMembershipStore();

  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  return {
    status,
    membershipEndDate,
    needsRenewal,
    loading,
    refetchMembership,
  };
}

export default useMembership;
