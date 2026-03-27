import { useQuery } from "@tanstack/react-query";
import { storage } from "@/utils/storage";

export function useMembers(selectedGroup, setIsOnline) {
  return useQuery({
    queryKey: ["members", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      try {
        const response = await fetch(`/api/groups/${selectedGroup.id}/members`);
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();
        await storage.setItem(
          `cached_members_${selectedGroup.id}`,
          JSON.stringify(data.members),
        );
        setIsOnline(true);
        return data.members;
      } catch (error) {
        setIsOnline(false);
        const cached = await storage.getItem(
          `cached_members_${selectedGroup.id}`,
        );
        if (cached) {
          console.log("Loading members from cache (offline)");
          return JSON.parse(cached);
        }
        return [];
      }
    },
    enabled: !!selectedGroup,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
