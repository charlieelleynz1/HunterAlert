import { Alert } from "react-native";

export function createMapPressHandler(
  selectedGroup,
  geofenceMode,
  setGeofenceLocation,
  setShowGeofenceForm,
) {
  return (event) => {
    if (!selectedGroup) {
      Alert.alert(
        "Select a group",
        "Please select a group first to add geofences",
      );
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (geofenceMode === "add") {
      setGeofenceLocation({ latitude, longitude });
      setShowGeofenceForm(true);
    }
  };
}

export function createGeofenceMarkerPressHandler(
  geofenceMode,
  currentUser,
  selectedGroup,
  queryClient,
  deviceId, // NEW: Add deviceId parameter
) {
  return (geofence) => {
    if (geofenceMode === "remove") {
      if (geofence.created_by !== currentUser?.id) {
        Alert.alert(
          "Cannot Delete",
          "You can only delete geofences you created.",
        );
        return;
      }

      Alert.alert(
        "Delete Geofence",
        `Are you sure you want to remove "${geofence.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Add deviceId to DELETE request if not authenticated
                const url = currentUser
                  ? `/api/geofences/${geofence.id}`
                  : `/api/geofences/${geofence.id}?deviceId=${deviceId}`;
                const response = await fetch(url, {
                  method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete geofence");
                queryClient.invalidateQueries({
                  queryKey: ["geofences", selectedGroup?.id],
                });
                Alert.alert("Success", "Geofence removed!");
              } catch (error) {
                console.error("Error deleting geofence:", error);
                Alert.alert("Error", "Failed to delete geofence");
              }
            },
          },
        ],
      );
    }
  };
}

export function createGeofenceSubmitHandler(
  geofenceLocation,
  createGeofenceMutation,
  selectedGroup,
  setGeofenceLocation,
  setShowGeofenceForm,
  setGeofenceMode,
) {
  return ({ name, radius, member_id }) => {
    if (!geofenceLocation) return;

    createGeofenceMutation.mutate({
      groupId: selectedGroup.id,
      name,
      latitude: geofenceLocation.latitude,
      longitude: geofenceLocation.longitude,
      radius,
      member_id,
    });

    setGeofenceLocation(null);
    setShowGeofenceForm(false);
    setGeofenceMode(null);
  };
}

export function createRefreshHandler(
  refetchGroups,
  selectedGroup,
  refetchMembers,
  refetchGeofences,
) {
  return () => {
    refetchGroups();
    if (selectedGroup) {
      refetchMembers();
      refetchGeofences();
    }
  };
}

export function createStartStopActivityHandler(
  selectedGroup,
  selectedMemberId,
  isActivityRunning,
  setIsActivityRunning,
  setShowEndTimeModal,
) {
  return () => {
    if (!selectedGroup) {
      Alert.alert(
        "Select a group",
        "Please select a group first to start tracking",
      );
      return;
    }

    if (!selectedMemberId) {
      Alert.alert(
        "Select identity",
        "Please select your member identity to start tracking",
      );
      return;
    }

    if (isActivityRunning) {
      Alert.alert(
        "Stop Activity",
        "Are you sure you want to stop tracking your location?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Stop",
            style: "destructive",
            onPress: async () => {
              // Clear expected end time
              try {
                await fetch(
                  `/api/members/${selectedMemberId}/expected-end-time`,
                  {
                    method: "DELETE",
                  },
                );
              } catch (error) {
                console.error("Error clearing expected end time:", error);
              }

              setIsActivityRunning(false);
              Alert.alert(
                "Activity Stopped",
                "Location tracking has been paused.",
              );
            },
          },
        ],
      );
    } else {
      // Show the expected end time modal
      setShowEndTimeModal(true);
    }
  };
}

export function createConfirmStartActivityHandler(
  selectedMemberId,
  setIsActivityRunning,
  setShowEndTimeModal,
) {
  return async (expectedEndTime) => {
    setShowEndTimeModal(false);

    // Set expected end time if provided
    if (expectedEndTime && selectedMemberId) {
      try {
        await fetch(`/api/members/${selectedMemberId}/expected-end-time`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expected_end_time: expectedEndTime }),
        });
      } catch (error) {
        console.error("Error setting expected end time:", error);
      }
    }

    setIsActivityRunning(true);
    Alert.alert(
      "Activity Started",
      expectedEndTime
        ? "Location tracking is active. You'll be warned if overdue."
        : "Location tracking is active. Updates every 10 seconds.",
      [{ text: "OK" }],
    );
  };
}

export function createAddRemoveGeofenceHandler(
  selectedGroup,
  geofenceMode,
  myGeofences,
  setGeofenceMode,
  setShowGeofenceForm,
  setGeofenceLocation,
) {
  return () => {
    if (!selectedGroup) {
      Alert.alert(
        "Select a group",
        "Please select a group first to manage geofences",
      );
      return;
    }

    if (geofenceMode === "add") {
      setGeofenceMode(null);
      setShowGeofenceForm(false);
      setGeofenceLocation(null);
    } else if (geofenceMode === "remove") {
      setGeofenceMode(null);
    } else {
      Alert.alert("Geofence Actions", "What would you like to do?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Add Geofence",
          onPress: () => {
            setGeofenceLocation(null);
            setShowGeofenceForm(false);
            setGeofenceMode("add");
            Alert.alert(
              "Add Mode",
              "Tap anywhere on the map to place a geofence",
            );
          },
        },
        {
          text: "Remove Geofence",
          style: "destructive",
          onPress: () => {
            if (myGeofences.length === 0) {
              Alert.alert(
                "No Geofences",
                "You haven't created any geofences yet",
              );
              return;
            }
            setGeofenceLocation(null);
            setShowGeofenceForm(false);
            setGeofenceMode("remove");
            Alert.alert(
              "Remove Mode",
              "Tap any of your geofences on the map to delete them",
            );
          },
        },
      ]);
    }
  };
}

export function createSOSHandler(selectedGroup, selectedMemberId) {
  return async () => {
    if (!selectedGroup || !selectedMemberId) {
      Alert.alert(
        "Cannot Send SOS",
        "Please select a group and member identity first",
      );
      return;
    }

    Alert.alert(
      "Send SOS Alert",
      "This will alert all members in your group of an emergency. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch("/api/sos/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  groupId: selectedGroup.id,
                  memberId: selectedMemberId,
                  message: "Emergency SOS Alert!",
                }),
              });

              if (!response.ok) throw new Error("Failed to send SOS");

              Alert.alert(
                "SOS Sent",
                "Emergency alert sent to all group members",
              );
            } catch (error) {
              console.error("Error sending SOS:", error);
              Alert.alert("Error", "Failed to send SOS alert");
            }
          },
        },
      ],
    );
  };
}

export function createResetAllHandler(
  myGeofences,
  selectedMemberId,
  selectedGroup,
  clearAllMutation,
  setSelectedGroup,
) {
  return () => {
    Alert.alert(
      "Reset All Settings",
      "This will clear all your data including geofences, location, and group selections. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset All",
          style: "destructive",
          onPress: () => {
            clearAllMutation.mutate({
              geofencesToDelete: myGeofences,
              memberId: selectedMemberId,
              groupId: selectedGroup?.id,
            });
            setSelectedGroup(null);
          },
        },
      ],
    );
  };
}

export function createDeleteAllMyGeofencesHandler(
  myGeofences,
  deleteAllMyGeofencesMutation,
  selectedMemberId,
  selectedGroup,
) {
  return () => {
    if (myGeofences.length === 0) {
      Alert.alert("No Geofences", "You haven't created any geofences yet");
      return;
    }

    Alert.alert(
      "Remove All Your Geofences",
      `Are you sure you want to remove all ${myGeofences.length} geofence${myGeofences.length > 1 ? "s" : ""} you created? This will also clear your location.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove All",
          style: "destructive",
          onPress: () => {
            const geofenceIds = myGeofences.map((g) => g.id);
            deleteAllMyGeofencesMutation.mutate({
              geofenceIds,
              memberId: selectedMemberId,
              groupId: selectedGroup?.id,
            });
          },
        },
      ],
    );
  };
}

export function createClearAllHandler(
  myGeofences,
  currentMember,
  clearAllMutation,
  selectedMemberId,
  selectedGroup,
) {
  return () => {
    if (myGeofences.length === 0 && !currentMember?.latitude) {
      Alert.alert(
        "Nothing to Clear",
        "You don't have any activities or geofences to clear",
      );
      return;
    }

    Alert.alert(
      "Clear All Data",
      `This will remove all your geofences (${myGeofences.length}) and reset your location data. Are you sure?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAllMutation.mutate({
              geofencesToDelete: myGeofences,
              memberId: selectedMemberId,
              groupId: selectedGroup?.id,
            });
          },
        },
      ],
    );
  };
}
