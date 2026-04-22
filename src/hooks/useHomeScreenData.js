import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";

export function useHomeScreenData(isGuest) {
  const { data: user } = useUser();

  // Fetch user profile - disabled for guests
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !isGuest && !!user,
  });

  // Fetch emergency contacts count - disabled for guests
  const { data: contactsData } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const response = await fetch("/api/emergency-contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: !isGuest && !!user,
  });

  // Fetch active members
  const { data: membersResponse, refetch: refetchMembers } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      console.log("🔄 HOME: Fetching members from server...");
      const response = await fetch("/api/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      console.log(
        "✅ HOME: Server returned",
        data.members?.length || 0,
        "members",
      );
      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const profile = profileData?.user;
  const contactCount = contactsData?.contacts?.length || 0;
  const activeMembers = membersResponse?.members || [];

  return {
    profile,
    profileLoading,
    contactCount,
    activeMembers,
    refetchMembers,
  };
}
