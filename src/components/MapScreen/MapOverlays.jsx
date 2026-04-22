import React from "react";
import { View } from "react-native";
import { NetworkStatusIndicator } from "./NetworkStatusIndicator";
import { LocationTrackingIndicator } from "./LocationTrackingIndicator";
import { MemberIdentityButton } from "./MemberIdentityButton";

export function MapOverlays({
  insets,
  isOnline,
  queuedUpdates,
  networkQuality,
  colors,
  currentLocation,
  isFocused,
  selectedMemberId,
  currentMember,
  savedUserName,
  onMemberIdentityPress,
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 20,
        left: 20,
        right: 20,
        zIndex: 10,
      }}
    >
      <NetworkStatusIndicator
        isOnline={isOnline}
        queuedUpdates={queuedUpdates}
        networkQuality={networkQuality}
      />

      <View style={{ marginTop: 12 }}>
        <LocationTrackingIndicator
          isTracking={!!currentLocation}
          isFocused={isFocused}
          selectedMemberId={selectedMemberId}
          colors={colors}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <MemberIdentityButton
          currentMember={currentMember}
          savedUserName={savedUserName}
          onPress={onMemberIdentityPress}
          colors={colors}
        />
      </View>
    </View>
  );
}
