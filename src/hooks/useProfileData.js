import { useQuery } from "@tanstack/react-query";

export function useProfileData() {
  const {
    data: contactsData,
    error: contactsError,
    refetch: refetchContacts,
    isRefetching: isRefetchingContacts,
  } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const response = await fetch("/api/emergency-contacts");
      if (!response.ok) throw new Error("Failed to fetch emergency contacts");
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: groupsData,
    error: groupsError,
    refetch: refetchGroups,
    isRefetching,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  return {
    contactsData,
    contactsError,
    refetchContacts,
    isRefetchingContacts,
    groupsData,
    groupsError,
    refetchGroups,
    isRefetching,
  };
}
