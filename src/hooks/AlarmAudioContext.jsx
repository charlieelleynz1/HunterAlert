import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAudioPlayer } from "expo-audio";
import { setAudioModeAsync } from "expo-audio";

// ─── SOUND URLS ───
// Wailing siren for hunting breaches (Mixkit "Vintage manual fire siren" — 47s, loops well)
const SIREN_URL =
  "https://assets.mixkit.co/active_storage/sfx/1657/1657-preview.mp3";

// Spoken "Adventurer close by" alert for non-hunting breaches
const ALARM_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/tts?text=${encodeURIComponent("Adventurer close by")}`;

// Spoken voice warning for hunting breaches — plays once alongside the siren
const HUNTING_VOICE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/tts?text=${encodeURIComponent("Danger, Danger, Hunter close by, make yourself safe, Danger, Danger")}`;

let audioModeConfigured = false;

async function ensureAudioMode() {
  if (audioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
    audioModeConfigured = true;
    console.log(
      "✅ AUDIO: Mode configured (plays in silent mode, stays active in background)",
    );
  } catch (err) {
    console.error("❌ AUDIO: Failed to configure audio mode:", err.message);
  }
}

const AlarmAudioContext = createContext(null);

/**
 * Provider that creates a SINGLE set of audio players shared across
 * the entire app. Place this in the tabs layout so all tab screens
 * share the same players.
 */
export function AlarmAudioProvider({ children }) {
  const [audioStatus, setAudioStatus] = useState("not_started");
  const audioModeSetRef = useRef(false);
  const pollRef = useRef(null);

  // Single set of players for the whole app
  const sirenPlayer = useAudioPlayer(SIREN_URL);
  const alarmPlayer = useAudioPlayer(ALARM_URL);
  const huntingVoicePlayer = useAudioPlayer(HUNTING_VOICE_URL);

  // Configure audio mode once
  useEffect(() => {
    if (audioModeSetRef.current) return;
    audioModeSetRef.current = true;
    ensureAudioMode().then(() => {
      setAudioStatus("loading");
    });
  }, []);

  // Poll for loaded state (lightweight, stops once ready)
  useEffect(() => {
    if (audioStatus === "ready") return;

    pollRef.current = setInterval(() => {
      const sirenLoaded = sirenPlayer?.isLoaded || false;
      const alarmLoaded = alarmPlayer?.isLoaded || false;
      const voiceLoaded = huntingVoicePlayer?.isLoaded || false;

      console.log(
        `🔊 AUDIO POLL: siren=${sirenLoaded}, alarm=${alarmLoaded}, voice=${voiceLoaded}`,
      );

      if (sirenLoaded && alarmLoaded && voiceLoaded) {
        console.log("✅ AUDIO: All three players LOADED and ready");
        setAudioStatus("ready");
        clearInterval(pollRef.current);
      } else if (sirenLoaded || alarmLoaded || voiceLoaded) {
        setAudioStatus("partial");
      }
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sirenPlayer, alarmPlayer, huntingVoicePlayer, audioStatus]);

  // Configure players for looping at max volume once created
  useEffect(() => {
    if (!sirenPlayer) return;
    sirenPlayer.volume = 1.0;
    sirenPlayer.loop = true;
  }, [sirenPlayer]);

  useEffect(() => {
    if (!alarmPlayer) return;
    alarmPlayer.volume = 1.0;
    alarmPlayer.loop = true;
  }, [alarmPlayer]);

  // Voice warning plays ONCE (not looped) at max volume
  useEffect(() => {
    if (!huntingVoicePlayer) return;
    huntingVoicePlayer.volume = 1.0;
    huntingVoicePlayer.loop = false;
  }, [huntingVoicePlayer]);

  const playSiren = useCallback(async () => {
    console.log("🔊 AUDIO: Playing SIREN + VOICE WARNING (hunting breach)");
    await ensureAudioMode();

    if (!sirenPlayer) {
      console.error("❌ AUDIO: Siren player is null");
      if (alarmPlayer) {
        console.log("🔊 AUDIO: Falling back to alarm player for siren");
        try {
          alarmPlayer.volume = 1.0;
          alarmPlayer.loop = true;
          alarmPlayer.seekTo(0);
          alarmPlayer.play();
          return true;
        } catch (fallbackErr) {
          console.error("❌ AUDIO: Fallback alarm also failed:", fallbackErr);
        }
      }
      return false;
    }

    try {
      // Stop the alarm player if it's going
      if (alarmPlayer && alarmPlayer.playing) {
        alarmPlayer.pause();
      }

      // Play the voice warning once: "Hunting Warning Invoked"
      if (huntingVoicePlayer) {
        try {
          huntingVoicePlayer.volume = 1.0;
          huntingVoicePlayer.loop = false;
          huntingVoicePlayer.seekTo(0);
          huntingVoicePlayer.play();
          console.log(
            "✅ AUDIO: Voice warning 'Danger Danger Hunter close by' playing",
          );
        } catch (voiceErr) {
          console.error(
            "⚠️ AUDIO: Voice warning failed (siren still plays):",
            voiceErr,
          );
        }
      }

      // Play the siren (loops continuously)
      sirenPlayer.volume = 1.0;
      sirenPlayer.loop = true;
      sirenPlayer.seekTo(0);
      sirenPlayer.play();
      console.log("✅ AUDIO: Siren play() called successfully");
      return true;
    } catch (err) {
      console.error("❌ AUDIO: Failed to play siren:", err);
      try {
        if (alarmPlayer) {
          console.log(
            "🔊 AUDIO: Falling back to alarm player after siren error",
          );
          alarmPlayer.volume = 1.0;
          alarmPlayer.loop = true;
          alarmPlayer.seekTo(0);
          alarmPlayer.play();
          return true;
        }
      } catch (fallbackErr) {
        console.error("❌ AUDIO: Fallback alarm also failed:", fallbackErr);
      }
      return false;
    }
  }, [sirenPlayer, alarmPlayer, huntingVoicePlayer]);

  const playAlarm = useCallback(async () => {
    console.log("🔊 AUDIO: Playing ALARM (non-hunting breach)");
    await ensureAudioMode();

    if (!alarmPlayer) {
      console.error("❌ AUDIO: Alarm player is null");
      // Fallback: try siren player instead so SOMETHING plays
      if (sirenPlayer) {
        console.log("🔊 AUDIO: Falling back to siren player for alarm");
        try {
          sirenPlayer.volume = 1.0;
          sirenPlayer.loop = true;
          sirenPlayer.seekTo(0);
          sirenPlayer.play();
          return true;
        } catch (fallbackErr) {
          console.error("❌ AUDIO: Fallback siren also failed:", fallbackErr);
        }
      }
      return false;
    }

    try {
      // Stop the other player if it's going
      if (sirenPlayer && sirenPlayer.playing) {
        sirenPlayer.pause();
      }
      alarmPlayer.volume = 1.0;
      alarmPlayer.loop = true;
      alarmPlayer.seekTo(0);
      alarmPlayer.play();
      console.log("✅ AUDIO: Alarm play() called successfully");
      return true;
    } catch (err) {
      console.error("❌ AUDIO: Failed to play alarm:", err);
      // Fallback: try siren player
      try {
        if (sirenPlayer) {
          console.log(
            "🔊 AUDIO: Falling back to siren player after alarm error",
          );
          sirenPlayer.volume = 1.0;
          sirenPlayer.loop = true;
          sirenPlayer.seekTo(0);
          sirenPlayer.play();
          return true;
        }
      } catch (fallbackErr) {
        console.error("❌ AUDIO: Fallback siren also failed:", fallbackErr);
      }
      return false;
    }
  }, [alarmPlayer, sirenPlayer]);

  const stopAll = useCallback(async () => {
    console.log("⏹️ AUDIO: Stopping all sounds");
    try {
      if (sirenPlayer) sirenPlayer.pause();
    } catch (e) {
      console.error("Error stopping siren:", e);
    }
    try {
      if (alarmPlayer) alarmPlayer.pause();
    } catch (e) {
      console.error("Error stopping alarm:", e);
    }
    try {
      if (huntingVoicePlayer) huntingVoicePlayer.pause();
    } catch (e) {
      console.error("Error stopping voice warning:", e);
    }
  }, [sirenPlayer, alarmPlayer, huntingVoicePlayer]);

  const isPlaying = useCallback(() => {
    return sirenPlayer?.playing || false || alarmPlayer?.playing || false;
  }, [sirenPlayer, alarmPlayer]);

  const value = {
    audioReady: audioStatus === "ready",
    audioStatus,
    sirenPlayer,
    alarmPlayer,
    huntingVoicePlayer,
    playSiren,
    playAlarm,
    stopAll,
    isPlaying,
  };

  return (
    <AlarmAudioContext.Provider value={value}>
      {children}
    </AlarmAudioContext.Provider>
  );
}

/**
 * Drop-in replacement for the old useAlarmAudio hook.
 * Just reads from the shared context instead of creating new players.
 */
export function useAlarmAudio() {
  const ctx = useContext(AlarmAudioContext);
  if (!ctx) {
    // Fallback if used outside provider — return safe defaults
    console.warn("⚠️ useAlarmAudio used outside AlarmAudioProvider");
    return {
      audioReady: false,
      audioStatus: "not_started",
      sirenPlayer: null,
      alarmPlayer: null,
      playSiren: async () => false,
      playAlarm: async () => false,
      stopAll: async () => {},
      isPlaying: () => false,
    };
  }
  return ctx;
}

// Re-export utilities
export function forceReinitializeAudio() {
  console.log("🔄 FORCING AUDIO MODE RECONFIGURATION...");
  audioModeConfigured = false;
  return ensureAudioMode();
}

export function cleanupGlobalAudio() {
  console.log("🧹 Audio cleanup called");
  audioModeConfigured = false;
}
