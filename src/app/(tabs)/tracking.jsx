import React, { useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { useAppTheme } from "@/utils/theme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSimpleLocationTracking } from "@/hooks/useSimpleLocationTracking";
import { useCombinedGeofenceAlarm } from "@/hooks/useGeofenceAlarm";
import { useAlarmAudio } from "@/hooks/useAlarmAudio";
import { useTrackingSync } from "@/hooks/useTrackingSync";
import { MapViewWithMarkers } from "@/components/MapScreen/MapViewWithMarkers";
import { MembershipRenewalBanner } from "@/components/MembershipRenewalBanner";
import useUser from "@/utils/auth/useUser";
import { useTrackingState } from "@/hooks/useTrackingState";
import { useTrackingData } from "@/hooks/useTrackingData";
import { useGeofenceCreation } from "@/hooks/useGeofenceCreation";
import { useMemberDeletionDetection } from "@/hooks/useMemberDeletionDetection";
import { useTrackingTimer } from "@/hooks/useTrackingTimer";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { SyncIndicator } from "@/components/TrackingScreen/SyncIndicator";
import { NetworkStatusBanner } from "@/components/TrackingScreen/NetworkStatusBanner";
import { StartingTrackingIndicator } from "@/components/TrackingScreen/StartingTrackingIndicator";
import { LocationTrackingIndicator } from "@/components/TrackingScreen/LocationTrackingIndicator";
import { GPSCenterButton } from "@/components/TrackingScreen/GPSCenterButton";
import { AdBannerWrapper } from "@/components/TrackingScreen/AdBannerWrapper";
import { AudioStatusIndicator } from "@/components/TrackingScreen/AudioStatusIndicator";
import { BreachDebugPanel } from "@/components/TrackingScreen/BreachDebugPanel";
import { EndAdventureButton } from "@/components/TrackingScreen/EndAdventureButton";
import { BreachAlertModal } from "@/components/TrackingScreen/BreachAlertModal";

export default function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const mapRef = useRef(null);
  const { data: user, loading: userLoading } = useUser();

  const {
    secondsAgo,
    setSecondsAgo,
    isFocused,
    setIsFocused,
    currentMemberId,
    setCurrentMemberId,
    myGeofenceId,
    setMyGeofenceId,
    geofenceLoaded,
    memberSetTimeRef,
  } = useTrackingState();

  const {
    isOnline,
    networkQuality,
    setIsOnline,
    refreshNetworkStatus,
    testMode,
    toggleTestMode,
  } = useNetworkStatus();

  const { isSyncing, activeTrackers, totalMembers, shouldShowSync } =
    useTrackingSync(!!currentMemberId, isOnline);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const [fontsLoaded, fontsError] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  const {
    profileData,
    profileLoading,
    geofencesData,
    membersData,
    membersLoading,
  } = useTrackingData(isOnline, setIsOnline, networkQuality);

  const currentMemberData = membersData.find((m) => m.id === currentMemberId);

  useMemberDeletionDetection(
    currentMemberId,
    currentMemberData,
    membersData,
    membersLoading,
    memberSetTimeRef,
    setCurrentMemberId,
    setSecondsAgo,
    setMyGeofenceId,
  );

  const {
    currentLocation,
    geofenceStatus,
    intruderStatus,
    isTrackingActive,
    lastUpdateTime,
  } = useSimpleLocationTracking(currentMemberId, isOnline);

  useGeofenceCreation(
    currentLocation,
    currentMemberId,
    isOnline,
    geofenceLoaded,
    myGeofenceId,
    setMyGeofenceId,
  );

  // ── ONE set of audio players, shared by both alarm hooks ──
  const {
    audioReady,
    audioStatus,
    sirenPlayer,
    alarmPlayer,
    playSiren,
    playAlarm,
    stopAll,
    isPlaying,
  } = useAlarmAudio();

  const audioControls = { playSiren, playAlarm, stopAll, isPlaying };

  // ── Single combined alarm hook — handles both geofence and intruder breaches ──
  // Using one hook prevents the race condition where two separate hooks
  // both try to seekTo(0) + play() on the same audio player simultaneously
  const {
    alertVisible,
    alertTitle,
    alertMessage: alarmMessage,
    alertIsHunting,
    dismissAlarm,
  } = useCombinedGeofenceAlarm(
    geofenceStatus,
    intruderStatus,
    isFocused,
    currentMemberData?.role || "adventurer",
    audioControls,
  );

  const pulseAnim = usePulseAnimation(currentMemberId);
  useTrackingTimer(lastUpdateTime, currentMemberId, setSecondsAgo);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  if (userLoading || profileLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  const hasNetworkIssues =
    !isOnline ||
    networkQuality === "fair" ||
    networkQuality === "poor" ||
    testMode;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <MembershipRenewalBanner colors={colors} />

      <SyncIndicator
        shouldShowSync={shouldShowSync}
        activeTrackers={activeTrackers}
        totalMembers={totalMembers}
        insets={insets}
      />

      <NetworkStatusBanner
        isOnline={isOnline}
        networkQuality={networkQuality}
        testMode={testMode}
        shouldShowSync={shouldShowSync}
        insets={insets}
        refreshNetworkStatus={refreshNetworkStatus}
        toggleTestMode={toggleTestMode}
      />

      <StartingTrackingIndicator
        currentMemberId={currentMemberId}
        currentLocation={currentLocation}
        insets={insets}
        hasNetworkIssues={hasNetworkIssues}
      />

      <LocationTrackingIndicator
        currentMemberId={currentMemberId}
        currentLocation={currentLocation}
        isTrackingActive={isTrackingActive}
        secondsAgo={secondsAgo}
        pulseAnim={pulseAnim}
        insets={insets}
        hasNetworkIssues={hasNetworkIssues}
      />

      <GPSCenterButton
        currentLocation={currentLocation}
        mapRef={mapRef}
        colors={colors}
        insets={insets}
        hasNetworkIssues={hasNetworkIssues}
        currentMemberId={currentMemberId}
        shouldShowSync={shouldShowSync}
      />

      <AdBannerWrapper
        insets={insets}
        hasNetworkIssues={hasNetworkIssues}
        currentMemberId={currentMemberId}
        currentLocation={currentLocation}
      />

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapViewWithMarkers
          mapRef={mapRef}
          currentLocation={currentLocation}
          geofencesData={geofencesData || []}
          membersData={membersData || []}
          colors={colors}
          isActivityRunning={!!currentMemberId}
          currentMemberId={currentMemberId}
          myGeofenceId={myGeofenceId}
        />
      </View>

      <AudioStatusIndicator
        currentMemberId={currentMemberId}
        audioStatus={audioStatus}
        sirenPlayer={sirenPlayer}
        beepPlayer={alarmPlayer}
        insets={insets}
        hasNetworkIssues={hasNetworkIssues}
        currentLocation={currentLocation}
      />

      <BreachDebugPanel
        currentMemberId={currentMemberId}
        geofenceStatus={geofenceStatus}
        intruderStatus={intruderStatus}
        isFocused={isFocused}
        insets={insets}
      />

      <EndAdventureButton currentMemberId={currentMemberId} insets={insets} />

      {/* Breach alert modal — delays the OK button so user hears the alarm */}
      <BreachAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alarmMessage}
        isHunting={alertIsHunting}
        onDismiss={dismissAlarm}
      />
    </View>
  );
}
