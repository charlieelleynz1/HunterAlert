import { useQuery } from "@tanstack/react-query";
import { storage } from "@/utils/storage";

export function useGeofences(selectedGroup, setIsOnline) {
  return useQuery({
    queryKey: ["geofences", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      try {
        const response = await fetch(
          `/api/geofences?groupId=${selectedGroup.id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch geofences");
        const data = await response.json();
        await storage.setItem(
          `cached_geofences_${selectedGroup.id}`,
          JSON.stringify(data.geofences),
        );
        setIsOnline(true);
        return data.geofences;
      } catch (error) {
        setIsOnline(false);
        const cached = await storage.getItem(
          `cached_geofences_${selectedGroup.id}`,
        );
        if (cached) {
          console.log("Loading geofences from cache (offline)");
          return JSON.parse(cached);
        }
        return [];
      }
    },
    enabled: !!selectedGroup,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
