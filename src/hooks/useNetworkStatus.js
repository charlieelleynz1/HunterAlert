import { useState, useEffect, useRef } from "react";

/**
 * Network status detection for constrained networks
 * Uses lightweight ping to detect connectivity including satellite
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkQuality, setNetworkQuality] = useState("unknown"); // 'good', 'fair', 'poor', 'offline', 'unknown'
  const [testMode, setTestMode] = useState(false); // Test mode for dev
  const checkInterval = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Initial check
    checkNetworkStatus();

    // Check every 60 seconds (was 30s - improved for battery life)
    checkInterval.current = setInterval(checkNetworkStatus, 60000);

    return () => {
      mountedRef.current = false;
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [testMode]); // Re-run when test mode changes

  const checkNetworkStatus = async () => {
    if (!mountedRef.current || testMode) return; // Skip auto-check in test mode

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for satellite

      const startTime = Date.now();

      // Lightweight HEAD request to check connectivity
      const response = await fetch("/api/geofences/status", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (mountedRef.current) {
        if (response.ok || response.status === 204) {
          setIsOnline(true);
          // Determine quality based on latency
          // Satellite: 500-1500ms, 4G: 50-100ms, 3G: 100-500ms
          if (latency < 200) {
            setNetworkQuality("good");
          } else if (latency < 2000) {
            setNetworkQuality("fair"); // Satellite range
          } else {
            setNetworkQuality("poor");
          }
          console.log(
            `✅ Network: Online (${latency}ms, quality: ${networkQuality})`,
          );
        } else {
          console.warn(
            `⚠️ Network check failed with status: ${response.status}`,
          );
          // Don't immediately mark as offline for non-critical errors
          if (response.status >= 500) {
            setIsOnline(false);
            setNetworkQuality("offline");
          }
        }
      }
    } catch (error) {
      console.error("❌ Network check error:", error.name, error.message);

      if (mountedRef.current) {
        // Only mark as offline for actual network errors
        if (
          error.name === "AbortError" ||
          error.name === "TypeError" ||
          error.message.includes("Network request failed")
        ) {
          setIsOnline(false);
          setNetworkQuality("offline");
        } else {
          // For other errors, assume we're still online
          console.log("⚠️ Assuming online despite error");
        }
      }
    }
  };

  // Manual refresh function
  const refreshNetworkStatus = () => {
    if (!testMode) {
      checkNetworkStatus();
    }
  };

  // Toggle test mode for development
  const toggleTestMode = (forceOffline = false) => {
    setTestMode(!testMode);
    if (!testMode) {
      // Entering test mode
      setIsOnline(!forceOffline);
      setNetworkQuality(forceOffline ? "offline" : "good");
      console.log(
        `🧪 Test mode enabled - ${forceOffline ? "Offline" : "Online"}`,
      );
    } else {
      // Exiting test mode
      console.log("🧪 Test mode disabled - resuming normal detection");
      checkNetworkStatus();
    }
  };

  return {
    isOnline,
    networkQuality,
    refreshNetworkStatus,
    setIsOnline, // Allow manual override if needed
    testMode,
    toggleTestMode,
  };
}
