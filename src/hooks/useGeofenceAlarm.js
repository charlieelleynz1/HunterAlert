import { useState, useEffect, useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Vibration } from "react-native";

/**
 * Combined geofence alarm hook — handles BOTH geofenceStatus and intruderStatus
 * in a single hook to prevent race conditions with shared audio players.
 *
 * ALARM RULES:
 * 1. Breach where NEITHER member is a hunter → loud alarm on BOTH phones
 * 2. Breach where EITHER or BOTH members are hunters → wailing siren on BOTH phones
 *
 * Both phones get the alarm because:
 * - The phone entering the zone gets geofenceStatus (isInside=true)
 * - The phone whose zone was entered gets intruderStatus (hasIntruders=true)
 *
 * Returns alert state for rendering a custom BreachAlertModal (instead of
 * the native Alert.alert) so we can delay the OK button and prevent
 * accidental early dismissal.
 *
 * @param {object} geofenceStatus - geofenceStatus from the server (zones you entered)
 * @param {object} intruderStatus - intruderStatus from the server (who entered your zone)
 * @param {boolean} isFocused - whether the screen is focused
 * @param {string} memberRole - role of THIS member ("hunter" or "adventurer")
 * @param {object} audioControls - { playSiren, playAlarm, stopAll } from useAlarmAudio
 */
export function useCombinedGeofenceAlarm(
  geofenceStatus,
  intruderStatus,
  isFocused,
  memberRole,
  audioControls,
) {
  const [lastGeofenceBreachIds, setLastGeofenceBreachIds] = useState(null);
  const [lastIntruderBreachIds, setLastIntruderBreachIds] = useState(null);
  const [geofenceTriggered, setGeofenceTriggered] = useState(false);
  const [intruderTriggered, setIntruderTriggered] = useState(false);
  const mountedRef = useRef(true);

  // ─── Alert modal state (replaces native Alert.alert) ───
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    isHunting: false,
  });

  // Single shared lock — prevents both breach types from firing simultaneously
  const alarmActiveRef = useRef(false);
  const alarmTimeoutRef = useRef(null);

  // Track breach timing to prevent rapid flickering
  const breachStartTimeRef = useRef(null);
  const MIN_BREACH_DURATION = 5000;

  // CRITICAL: Use refs for values accessed inside alarm callbacks/closures
  // This prevents stale closure issues where effects capture old values
  const audioControlsRef = useRef(audioControls);
  const memberRoleRef = useRef(memberRole);
  const isFocusedRef = useRef(isFocused);

  // Keep refs in sync
  useEffect(() => {
    audioControlsRef.current = audioControls;
  }, [audioControls]);

  useEffect(() => {
    memberRoleRef.current = memberRole;
  }, [memberRole]);

  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
      }
    };
  }, []);

  // ─── Dismiss handler — called from the BreachAlertModal OK button ───
  const dismissAlarm = useCallback(async () => {
    console.log("✅ User dismissed alarm via modal");
    Vibration.cancel();

    const controls = audioControlsRef.current;
    if (controls) {
      await controls.stopAll();
    }

    setAlertState({ visible: false, title: "", message: "", isHunting: false });
    alarmActiveRef.current = false;
    breachStartTimeRef.current = null;
  }, []);

  // ─── Show alarm: handles audio, vibration, and sets modal state ───
  const showAlarm = useCallback(async (alertMessage, isHunting) => {
    if (!mountedRef.current || !isFocusedRef.current) return;

    alarmActiveRef.current = true;

    const soundLabel = isHunting ? "WAILING SIREN" : "ALARM";
    const currentRole = memberRoleRef.current;
    const currentAudioControls = audioControlsRef.current;

    console.log(`🚨🔊 BREACH ALARM TRIGGERED: ${soundLabel}`);
    console.log(`   Message: ${alertMessage}`);
    console.log(`   Hunting involved: ${isHunting}`);
    console.log(`   This member's role: ${currentRole}`);
    console.log(`   Audio controls available: ${!!currentAudioControls}`);
    console.log(`   playSiren available: ${!!currentAudioControls?.playSiren}`);
    console.log(`   playAlarm available: ${!!currentAudioControls?.playAlarm}`);

    // 1. START AUDIO — pick siren or alarm based on hunting involvement
    try {
      if (currentAudioControls) {
        let audioStarted = false;
        if (isHunting) {
          console.log(`🔊 Calling playSiren()...`);
          audioStarted = await currentAudioControls.playSiren();
        } else {
          console.log(`🔊 Calling playAlarm()...`);
          audioStarted = await currentAudioControls.playAlarm();
        }
        console.log(`✅ ${soundLabel} play requested, result: ${audioStarted}`);
      } else {
        console.error("❌ No audio controls available — vibration only");
      }
    } catch (err) {
      console.error(`❌ Failed to play ${soundLabel}:`, err);
    }

    // 2. HAPTIC — strong error-type feedback
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Haptics not available on all devices
    }

    // 3. VIBRATION — continuous strong pattern
    Vibration.vibrate([0, 1000, 500, 1000, 500, 1000, 500, 1000], true);

    // 4. SHOW MODAL — the BreachAlertModal handles the delayed OK button
    const title = isHunting ? "🚨 HUNTER ALERT!" : "🔔 ZONE ALERT!";

    setAlertState({
      visible: true,
      title,
      message: alertMessage,
      isHunting,
    });

    // Safety: auto-unlock after 90 seconds
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
    }
    alarmTimeoutRef.current = setTimeout(() => {
      if (alarmActiveRef.current) {
        console.warn("⚠️ BREACH AUTO-UNLOCKED after 90s timeout");
        Vibration.cancel();
        const controls = audioControlsRef.current;
        if (controls) {
          controls.stopAll();
        }
        setAlertState({
          visible: false,
          title: "",
          message: "",
          isHunting: false,
        });
        alarmActiveRef.current = false;
      }
    }, 90000);
  }, []); // No deps needed — reads everything from refs

  // ─── Fire alarm: handles deduplication ───
  const fireAlarm = useCallback(
    (alertMessage, isHunting) => {
      if (!mountedRef.current || !isFocusedRef.current) return;

      console.log(
        `🔥 fireAlarm called: "${alertMessage}", isHunting=${isHunting}`,
      );

      // If an alarm is already active, drop this one — both breach types
      // (geofence + intruder) fire for the same encounter, so one alert is enough
      if (alarmActiveRef.current) {
        console.log(
          "⚠️ ALARM: Already active, dropping duplicate:",
          alertMessage,
        );
        return;
      }

      showAlarm(alertMessage, isHunting);
    },
    [showAlarm],
  );

  // ─── Process geofenceStatus changes ───
  useEffect(() => {
    if (!isFocused || !geofenceStatus) return;
    if (geofenceStatus.stale) return;

    if (geofenceStatus.isInside && geofenceStatus.geofences?.length > 0) {
      const currentBreachIds = geofenceStatus.geofences
        .map((g) => `${g.id}_${g.zone_owner_id || g.created_by}`)
        .sort()
        .join(",");

      if (!breachStartTimeRef.current) {
        breachStartTimeRef.current = Date.now();
      }

      const breachesChanged = lastGeofenceBreachIds !== currentBreachIds;

      if (!geofenceTriggered || breachesChanged) {
        const otherMembers = geofenceStatus.geofences
          .map((g) => g.otherMemberName || "Unknown")
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        // CRITICAL: Determine if any hunter is involved
        const thisIsHunter = memberRole === "hunter";
        const otherIsHunter = geofenceStatus.geofences.some(
          (g) => g.otherMemberRole === "hunter",
        );
        const anyHunter = thisIsHunter || otherIsHunter;

        console.log("🔍 GEOFENCE BREACH - Hunter check:", {
          thisRole: memberRole,
          thisIsHunter,
          otherRoles: geofenceStatus.geofences.map((g) => ({
            name: g.otherMemberName,
            role: g.otherMemberRole,
            zone_owner_role: g.zone_owner_role,
            creator_role: g.creator_role,
          })),
          otherIsHunter,
          anyHunter,
          willPlaySiren: anyHunter,
        });

        fireAlarm(`You entered ${otherMembers}'s zone`, anyHunter);
        setGeofenceTriggered(true);
        setLastGeofenceBreachIds(currentBreachIds);
      }
    } else if (!geofenceStatus.isInside) {
      if (breachStartTimeRef.current) {
        const dur = Date.now() - breachStartTimeRef.current;
        if (dur < MIN_BREACH_DURATION) return;
      }
      if (geofenceTriggered || lastGeofenceBreachIds) {
        setGeofenceTriggered(false);
        setLastGeofenceBreachIds(null);
        if (!intruderTriggered) {
          breachStartTimeRef.current = null;
        }
      }
    }
  }, [
    geofenceStatus,
    isFocused,
    memberRole,
    geofenceTriggered,
    lastGeofenceBreachIds,
    fireAlarm,
  ]);

  // ─── Process intruderStatus changes ───
  useEffect(() => {
    if (!isFocused || !intruderStatus) return;
    if (intruderStatus.stale) return;

    if (intruderStatus.hasIntruders && intruderStatus.intruders?.length > 0) {
      const currentIntruderIds = intruderStatus.intruders
        .map((i) => `${i.id}`)
        .sort()
        .join(",");

      if (!breachStartTimeRef.current) {
        breachStartTimeRef.current = Date.now();
      }

      const intrudersChanged = lastIntruderBreachIds !== currentIntruderIds;

      if (!intruderTriggered || intrudersChanged) {
        const intruderNames = intruderStatus.intruders
          .map((i) => i.name || "Unknown")
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        const zoneNames = intruderStatus.intruders
          .map((i) => i.geofenceName || "My Zone")
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        // CRITICAL: Determine if any hunter is involved
        const thisIsHunter = memberRole === "hunter";
        const intruderIsHunter = intruderStatus.intruders.some(
          (i) => i.role === "hunter",
        );
        const anyHunter = thisIsHunter || intruderIsHunter;

        console.log("🔍 INTRUDER BREACH - Hunter check:", {
          thisRole: memberRole,
          thisIsHunter,
          intruderRoles: intruderStatus.intruders.map((i) => ({
            name: i.name,
            role: i.role,
          })),
          intruderIsHunter,
          anyHunter,
          willPlaySiren: anyHunter,
        });

        fireAlarm(`${intruderNames} entered ${zoneNames}`, anyHunter);
        setIntruderTriggered(true);
        setLastIntruderBreachIds(currentIntruderIds);
      }
    } else if (!intruderStatus.hasIntruders) {
      if (breachStartTimeRef.current) {
        const dur = Date.now() - breachStartTimeRef.current;
        if (dur < MIN_BREACH_DURATION) return;
      }
      if (intruderTriggered || lastIntruderBreachIds) {
        setIntruderTriggered(false);
        setLastIntruderBreachIds(null);
        if (!geofenceTriggered) {
          breachStartTimeRef.current = null;
        }
      }
    }
  }, [
    intruderStatus,
    isFocused,
    memberRole,
    intruderTriggered,
    lastIntruderBreachIds,
    fireAlarm,
  ]);

  // Return alert state so the tracking screen can render the BreachAlertModal
  return {
    alertVisible: alertState.visible,
    alertTitle: alertState.title,
    alertMessage: alertState.message,
    alertIsHunting: alertState.isHunting,
    dismissAlarm,
  };
}

// Keep the old export name as an alias for backwards compat during transition
export const useGeofenceAlarm = useCombinedGeofenceAlarm;
