import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

export function useLocationPermission() {
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationEnabled(status === "granted");
  };

  const toggleLocation = async () => {
    if (locationEnabled) {
      Alert.alert(
        "Disable Location",
        "This will stop sharing your location with groups. You can re-enable it in your device settings.",
        [{ text: "OK" }],
      );
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === "granted");
    }
  };

  return {
    locationEnabled,
    toggleLocation,
  };
}
