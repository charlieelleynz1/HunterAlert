import { useEffect, useRef } from "react";
import { Alert, Vibration } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";

export function useOverdueCheck(selectedGroup, isFocused) {
  const queryClient = useQueryClient();
  const checkInterval = useRef(null);
  const lastCheckTime = useRef(null);

  const overdueCheckMutation = useMutation({
    mutationFn: async (groupId) => {
      const response = await fetch("/api/members/overdue-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        throw new Error("Failed to check overdue members");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Handle warnings
      if (data.warningsSent && data.warningsSent.length > 0) {
        for (const warning of data.warningsSent) {
          Alert.alert(
            "⚠️ Overdue Warning",
            `${warning.userName} is overdue! Expected to finish at ${new Date(warning.expectedEndTime).toLocaleTimeString()}.\n\nAuto-SOS will be sent in 5 minutes if not checked in.`,
            [
              {
                text: "OK",
                style: "default",
              },
            ],
          );
          Vibration.vibrate([0, 500, 200, 500]);

          // Send local notification
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "⚠️ Member Overdue",
                body: `${warning.userName} hasn't checked in. Auto-SOS in 5 minutes.`,
                sound: true,
              },
              trigger: null,
            });
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
          }
        }

        // Refresh members data
        queryClient.invalidateQueries({ queryKey: ["members"] });
      }

      // Handle auto-SOS
      if (data.autoSOSSent && data.autoSOSSent.length > 0) {
        for (const sos of data.autoSOSSent) {
          Alert.alert(
            "🚨 Auto-SOS Sent",
            `${sos.userName} is significantly overdue. Automatic SOS has been sent to all group members with their last known location.`,
            [
              {
                text: "View Location",
                onPress: () => {
                  // Could navigate to map showing their location
                  console.log("Location:", sos.latitude, sos.longitude);
                },
              },
              {
                text: "OK",
                style: "cancel",
              },
            ],
          );
          Vibration.vibrate([0, 1000, 200, 1000, 200, 1000]);

          // Send critical notification
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🚨 Auto-SOS Triggered",
                body: `${sos.userName} is overdue. Emergency alert sent.`,
                sound: true,
                priority: "high",
              },
              trigger: null,
            });
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
          }
        }

        // Refresh members and trigger SOS notification to group
        queryClient.invalidateQueries({ queryKey: ["members"] });
      }
    },
    onError: (error) => {
      console.error("Overdue check error:", error);
    },
  });

  useEffect(() => {
    if (!selectedGroup || !isFocused) {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
        checkInterval.current = null;
      }
      return;
    }

    // Check immediately on mount
    if (!lastCheckTime.current || Date.now() - lastCheckTime.current > 60000) {
      overdueCheckMutation.mutate(selectedGroup.id);
      lastCheckTime.current = Date.now();
    }

    // Check every minute
    checkInterval.current = setInterval(() => {
      overdueCheckMutation.mutate(selectedGroup.id);
      lastCheckTime.current = Date.now();
    }, 60 * 1000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
        checkInterval.current = null;
      }
    };
  }, [selectedGroup?.id, isFocused]);

  return {
    isChecking: overdueCheckMutation.isPending,
  };
}
