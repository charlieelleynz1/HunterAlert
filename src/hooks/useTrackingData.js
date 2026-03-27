import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { storage } from "@/utils/storage";

export function useTrackingData(isOnline, setIsOnline, networkQuality) {
  const { data: user } = useUser();
  const { deviceId } = useDeviceIdentity();

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!user,
  });

  // Network-aware geofence refresh interval
  const getGeofenceRefreshInterval = () => {
    if (!isOnline) return false;
    if (networkQuality === "poor") return 60000;
    if (networkQuality === "fair") return 30000;
    return 15000;
  };

  // Fetch all geofences with network-aware intervals
  const { data: geofencesResponse } = useQuery({
    queryKey: ["geofences"],
    queryFn: async () => {
      try {
        const url = user
          ? "/api/geofences"
          : `/api/geofences?deviceId=${deviceId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch geofences");
        const data = await response.json();
        await storage.setItem(
          "cached_geofences_all",
          JSON.stringify(data.geofences),
        );
        setIsOnline(true);
        return data;
      } catch (error) {
        setIsOnline(false);
        const cached = await storage.getItem("cached_geofences_all");
        if (cached) {
          console.log("📦 Loading geofences from cache (offline)");
          return { geofences: JSON.parse(cached) };
        }
        return { geofences: [] };
      }
    },
    enabled: !!user || !!deviceId,
    refetchInterval: getGeofenceRefreshInterval(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Fetch all members for display
  const { data: membersResponse, isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      try {
        const url = user ? "/api/members" : `/api/members?deviceId=${deviceId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();
        await storage.setItem(
          "cached_members_all",
          JSON.stringify(data.members),
        );
        setIsOnline(true);
        return data;
      } catch (error) {
        setIsOnline(false);
        const cached = await storage.getItem("cached_members_all");
        if (cached) {
          console.log("📦 Loading members from cache (offline)");
          return { members: JSON.parse(cached) };
        }
        return { members: [] };
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    enabled: !!user || !!deviceId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const geofencesData = geofencesResponse?.geofences || [];
  const membersData = membersResponse?.members || [];

  return {
    profileData,
    profileLoading,
    geofencesData,
    membersData,
    membersLoading,
  };
}
