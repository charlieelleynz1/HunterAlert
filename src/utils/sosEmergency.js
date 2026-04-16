/**
 * Global SOS Emergency Priority System
 * When SOS is activated, all other operations are immediately cancelled
 * This has ABSOLUTE PRIORITY over all app operations
 */

let sosActiveFlag = false;
let sosAbortController = null;
const sosListeners = new Set();

export const sosEmergency = {
  /**
   * Activate SOS - this cancels ALL other operations immediately
   * HIGHEST PRIORITY - nothing can override this
   */
  activate: () => {
    console.log("🚨 ========================================");
    console.log("🚨 SOS EMERGENCY ACTIVATED");
    console.log("🚨 CANCELLING ALL OPERATIONS IMMEDIATELY");
    console.log("🚨 ========================================");

    sosActiveFlag = true;

    // Abort any ongoing fetch requests
    if (sosAbortController) {
      sosAbortController.abort();
    }
    sosAbortController = new AbortController();

    // Notify all listeners to stop what they're doing IMMEDIATELY
    console.log(`🚨 Notifying ${sosListeners.size} listeners to abort`);
    sosListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in SOS listener:", error);
      }
    });

    return sosAbortController.signal;
  },

  /**
   * Deactivate SOS after completion
   */
  deactivate: () => {
    console.log("✅ ========================================");
    console.log("✅ SOS EMERGENCY COMPLETED");
    console.log("✅ RESUMING NORMAL OPERATIONS");
    console.log("✅ ========================================");
    sosActiveFlag = false;
    sosAbortController = null;
  },

  /**
   * Check if SOS is currently active
   */
  isActive: () => sosActiveFlag,

  /**
   * Get the abort signal for SOS operations
   */
  getAbortSignal: () => sosAbortController?.signal,

  /**
   * Register a listener that gets called when SOS is activated
   * Returns an unregister function
   * These listeners are called IMMEDIATELY when SOS activates
   */
  onActivate: (callback) => {
    sosListeners.add(callback);
    return () => sosListeners.delete(callback);
  },

  /**
   * Throw an error if SOS is active (for use in operations that should abort)
   * This should be called at the START and throughout long-running operations
   */
  checkAndAbort: (operationName = "Operation") => {
    if (sosActiveFlag) {
      const error = new Error(`${operationName} aborted: SOS emergency active`);
      error.code = "SOS_ABORT";
      console.log(`🚨 ${operationName} aborted for SOS emergency`);
      throw error;
    }
  },
};
