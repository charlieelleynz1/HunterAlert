import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { Play } from "lucide-react-native";

export function StartAdventureButton({
  selectedRole,
  isStarting,
  guestLimitReached,
  audioReady,
  colors,
  onPress,
}) {
  // After 10 seconds, allow starting even if audio hasn't loaded
  // (alarm will still attempt to play when needed, vibration always works)
  const [audioTimedOut, setAudioTimedOut] = useState(false);

  useEffect(() => {
    if (audioReady) {
      setAudioTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setAudioTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [audioReady]);

  const canStart = audioReady || audioTimedOut;
  const isDisabled = isStarting || guestLimitReached;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: guestLimitReached
          ? "#9CA3AF"
          : selectedRole === "hunter"
            ? colors.blue
            : colors.green,
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDisabled ? 0.05 : 0.15,
        shadowRadius: 12,
        elevation: isDisabled ? 1 : 4,
        marginBottom: 32,
        opacity: isDisabled ? 0.6 : 1,
      }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isStarting ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Play size={28} color="#FFFFFF" style={{ marginRight: 12 }} />
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Montserrat_700Bold",
              color: "#FFFFFF",
            }}
          >
            {guestLimitReached ? "Sign Up Required" : "Start Adventure"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
