// Re-export everything from the shared context so existing imports keep working
export {
  useAlarmAudio,
  forceReinitializeAudio,
  cleanupGlobalAudio,
} from "./AlarmAudioContext";
