import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteUser,
  listUsers,
  updateUserRole,
} from "../api/usersApi";

export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
};

export function useUsers({ role = "", page = 1, perPage = 20 } = {}) {
  const query = useQuery({
    queryKey: userKeys.list({ role, page, perPage }),
    queryFn: ({ signal }) => listUsers({ role, page, perPage, signal }),
  });

  return {
    users: query.data?.items ?? [],
    pagination: query.data?.pagination ?? {
      page,
      perPage,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrevious: false,
    },
    loading: query.isPending,
    refreshing: query.isFetching,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}