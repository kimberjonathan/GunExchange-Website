import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes - much longer cache
    gcTime: 60 * 60 * 1000, // 1 hour 
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on every component mount
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      
      return res.json();
    }
  });

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      // Clear all queries to reset authentication state
      queryClient.clear();
      // Force page reload to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear client state
      queryClient.clear();
      window.location.reload();
    }
  };

  // Remove excessive logging

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout
  };
}
