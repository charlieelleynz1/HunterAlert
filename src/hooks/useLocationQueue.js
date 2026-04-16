import { useState, useRef, useEffect } from "react";

export function useLocationQueue(
  selectedMemberId,
  isOnline,
  updateLocationMutation,
) {
  const [queuedUpdates, setQueuedUpdates] = useState(0);
  const locationQueue = useRef([]);
  const batchTimeout = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Clear timeout on unmount
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
        batchTimeout.current = null;
      }
    };
  }, []);

  // Clear queue when member is deselected or changed
  useEffect(() => {
    if (!selectedMemberId) {
      // Clear the queue, counter, and any pending flush
      locationQueue.current = [];
      setQueuedUpdates(0);
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
        batchTimeout.current = null;
      }
      console.log("📍 Queue cleared (no member selected)");
    }
  }, [selectedMemberId]);

  const flushLocationQueue = async () => {
    if (!mountedRef.current || locationQueue.current.length === 0) return null;

    const latestLocation =
      locationQueue.current[locationQueue.current.length - 1];
    const queueLength = locationQueue.current.length;
    locationQueue.current = [];
    setQueuedUpdates(0);

    console.log(`📤 Flushing ${queueLength} location update(s)...`);
    console.log(`   📍 Member ID: ${latestLocation.memberId}`);
    console.log(
      `   📍 Coordinates: (${latestLocation.latitude?.toFixed(6)}, ${latestLocation.longitude?.toFixed(6)})`,
    );
    console.log(`   🌐 Online: ${isOnline}`);
    console.log(`   👤 Selected Member: ${selectedMemberId}`);
    console.log(`   🏔️ Mounted: ${mountedRef.current}`);

    if (selectedMemberId && isOnline && mountedRef.current) {
      try {
        console.log(`   🚀 Sending to /api/locations...`);
        const result = await updateLocationMutation.mutateAsync(latestLocation);
        console.log(
          `✅ Successfully flushed ${queueLength} location update(s)`,
        );
        console.log(`   📊 Server response:`, result);
        return result;
      } catch (error) {
        console.error("❌ Failed to flush location:", error.message);
        console.error("   Full error:", error);
        if (mountedRef.current) {
          locationQueue.current.push(latestLocation);
          setQueuedUpdates(1);
          console.log("⚠️ Re-queued failed update");
        }
        return null;
      }
    } else {
      console.log(`   ⏸️ NOT SENDING because:`);
      console.log(
        `      - Has member ID: ${!!selectedMemberId} (${selectedMemberId})`,
      );
      console.log(`      - Is online: ${isOnline}`);
      console.log(`      - Is mounted: ${mountedRef.current}`);
    }
    return null;
  };

  const queueLocationUpdate = async (locationUpdate) => {
    if (!mountedRef.current) return null;

    console.log(`📍 queueLocationUpdate called:`, {
      memberId: locationUpdate.memberId,
      lat: locationUpdate.latitude?.toFixed(6),
      lng: locationUpdate.longitude?.toFixed(6),
      isOnline,
      selectedMemberId,
    });

    locationQueue.current.push(locationUpdate);
    const newQueueSize = locationQueue.current.length;
    setQueuedUpdates(newQueueSize);

    console.log(
      `📍 Location queued (size: ${newQueueSize}, online: ${isOnline})`,
    );

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    // If online and small queue, flush immediately and return result
    if (isOnline && locationQueue.current.length < 5) {
      console.log("🚀 Online with small queue - flushing immediately");
      const result = await flushLocationQueue();
      return result;
    } else {
      // Otherwise batch and flush later
      console.log(
        `⏳ Batching update (queue: ${newQueueSize}, online: ${isOnline})`,
      );
      if (locationQueue.current.length >= 5 || !isOnline) {
        batchTimeout.current = setTimeout(flushLocationQueue, 3 * 60 * 1000);
        console.log("⏰ Scheduled flush in 3 minutes");
      } else {
        batchTimeout.current = setTimeout(flushLocationQueue, 15000);
        console.log("⏰ Scheduled flush in 15 seconds");
      }
      return null;
    }
  };

  useEffect(() => {
    if (isOnline && locationQueue.current.length > 0 && mountedRef.current) {
      console.log(
        `🔄 Back online - flushing ${locationQueue.current.length} queued update(s)`,
      );
      flushLocationQueue();
    }
  }, [isOnline]);

  return { queuedUpdates, queueLocationUpdate, flushLocationQueue };
}
