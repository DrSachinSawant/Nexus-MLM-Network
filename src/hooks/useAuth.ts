import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      localStorage.removeItem("nexus_member_id");
      await utils.invalidate();
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem("nexus_member_id");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      isAdmin,
      logout,
    }),
    [user, isLoading, isAdmin, logout],
  );
}
