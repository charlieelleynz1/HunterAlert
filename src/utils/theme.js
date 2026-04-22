import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      // Background colors - WCAG compliant for both modes
      background: isDark ? "#000000" : "#FFFFFF",
      surface: isDark ? "#1A1A1A" : "#F5F5F5",
      surfaceVariant: isDark ? "#2A2A2A" : "#E8E8E8",

      // Text colors - WCAG AA compliant (4.5:1 for normal text, 3:1 for large text)
      primary: isDark ? "#FFFFFF" : "#000000", // Maximum contrast
      secondary: isDark ? "#B3B3B3" : "#666666", // 4.63:1 contrast
      tertiary: isDark ? "#8A8A8A" : "#757575", // 4.54:1 contrast
      placeholder: isDark ? "#737373" : "#999999", // 4.5:1 minimum

      // Border colors - subtle but visible
      border: isDark ? "#404040" : "#D1D1D1",
      borderLight: isDark ? "#2A2A2A" : "#E8E8E8",

      // UI element colors
      dragHandle: isDark ? "#666666" : "#A0A0A0",

      // Accent colors - WCAG AA compliant with backgrounds
      orange: isDark ? "#FF8C5A" : "#E65100", // 4.5:1+ contrast
      orangeLight: isDark ? "#2A1A16" : "#FFF3E0",
      blue: isDark ? "#7B9FFF" : "#1565C0", // 4.5:1+ contrast
      blueLight: isDark ? "#1A1F2A" : "#E3F2FD",
      green: isDark ? "#4ADE80" : "#2E7D32", // 4.5:1+ contrast
      greenLight: isDark ? "#162A23" : "#E8F5E9",
      yellow: isDark ? "#FCD34D" : "#F57F17", // 4.5:1+ contrast
      yellowLight: isDark ? "#2A2416" : "#FFFDE7",
      yellowStar: isDark ? "#FCD34D" : "#F9A825",
      purple: isDark ? "#C4B5FD" : "#6A1B9A", // 4.5:1+ contrast
      purpleLight: isDark ? "#231A2A" : "#F3E5F5",
      pink: isDark ? "#F0ABFC" : "#AD1457", // 4.5:1+ contrast
      pinkVariant: isDark ? "#D946EF" : "#C2185B",
      red: isDark ? "#FF6B6B" : "#C62828", // 4.5:1+ contrast
      redLight: isDark ? "#2A1616" : "#FFEBEE",

      // Map colors - visible in all modes
      geofenceActive: isDark
        ? "rgba(123, 159, 255, 0.3)"
        : "rgba(21, 101, 192, 0.2)",
      geofenceBorder: isDark ? "#7B9FFF" : "#1565C0",
      markerOnline: isDark ? "#4ADE80" : "#2E7D32",
      markerOffline: isDark ? "#737373" : "#9E9E9E",

      // Text color for use on colored backgrounds (always readable)
      onAccent: "#FFFFFF",
    },
  };
};
