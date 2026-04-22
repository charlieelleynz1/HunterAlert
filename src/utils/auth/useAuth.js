import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect } from "react";
import { useAuthModal, useAuthStore, authKey } from "./store";
import { storage } from "../storage";

/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey).then((auth) => {
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    });
  }, []);

  useEffect(() => {}, []);

  const signIn = useCallback(() => {
    open({ mode: "signin" });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: "signup" });
  }, [open]);

  const signOut = useCallback(async () => {
    try {
      // Clear member identity selections for all groups
      try {
        const allKeys = await storage.getAllKeys();
        const memberIdentityKeys = allKeys.filter((key) =>
          key.startsWith("member_identity_"),
        );
        await Promise.all(
          memberIdentityKeys.map((key) => storage.removeItem(key)),
        );
      } catch (error) {
        console.error("Error clearing member identities:", error);
      }

      // Clear auth state from SecureStore first
      await SecureStore.deleteItemAsync(authKey);

      // Update the auth store state immediately
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });

      // Wait a bit to ensure state propagates
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to launch screen
      router.replace("/auth/launch");
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force clear state even on error
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.replace("/auth/launch");
    }
  }, []);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;
