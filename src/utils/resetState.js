/**
 * Global Reset State Manager
 * Prevents SOS and other critical operations from running during a reset
 */

let resetActiveFlag = false;
const resetListeners = new Set();

export const resetState = {
  /**
   * Mark reset as in progress
   */
  activate: () => {
    console.log("🔄 RESET STARTED - Blocking SOS and other operations");
    resetActiveFlag = true;

    // Notify all listeners that reset has started
    resetListeners.forEach((listener) => {
      try {
        listener(true);
      } catch (error) {
        console.error("Error in reset listener:", error);
      }
    });
  },

  /**
   * Mark reset as completed
   */
  deactivate: () => {
    console.log("✅ RESET COMPLETED - SOS and operations now allowed");
    resetActiveFlag = false;

    // Notify all listeners that reset has completed
    resetListeners.forEach((listener) => {
      try {
        listener(false);
      } catch (error) {
        console.error("Error in reset listener:", error);
      }
    });
  },

  /**
   * Check if reset is currently in progress
   */
  isActive: () => resetActiveFlag,

  /**
   * Register a listener that gets called when reset state changes
   * Callback receives boolean: true when reset starts, false when it ends
   * Returns an unregister function
   */
  onChange: (callback) => {
    resetListeners.add(callback);
    // Immediately call with current state
    try {
      callback(resetActiveFlag);
    } catch (error) {
      console.error("Error calling reset listener:", error);
    }
    return () => resetListeners.delete(callback);
  },
};
