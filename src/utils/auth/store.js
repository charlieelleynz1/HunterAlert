import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set, get) => ({
  isReady: false,
  auth: null,
  setAuth: async (auth) => {
    console.log(
      "[AuthStore] setAuth called, saving auth:",
      auth ? "yes" : "no",
    );
    try {
      if (auth) {
        await SecureStore.setItemAsync(authKey, JSON.stringify(auth));
        console.log("[AuthStore] Auth saved to SecureStore successfully");
      } else {
        await SecureStore.deleteItemAsync(authKey);
        console.log("[AuthStore] Auth deleted from SecureStore successfully");
      }
      // Preserve isReady state when updating auth
      set({ auth, isReady: true });
      console.log(
        "[AuthStore] Store state updated, auth:",
        auth ? "set" : "cleared",
      );
    } catch (error) {
      console.error("[AuthStore] Error in setAuth:", error);
      // Still update state even on error
      set({ auth, isReady: true });
    }
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: "signup",
  open: (options) => set({ isOpen: true, mode: options?.mode || "signup" }),
  close: () => set({ isOpen: false }),
}));
