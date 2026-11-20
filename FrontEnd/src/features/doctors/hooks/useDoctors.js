/*
 * TODO: Expose doctor queries and admin mutations with cache handling.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  listDoctors,
  updateDoctor,
} from "../api/doctorsApi";

export const doctorKeys = {
  all: ["doctors"],
  lists: () => [...doctorKeys.all, "list"],
  detail: (userId) => [...doctorKeys.all, "detail", String(userId)],
};

export function useDoctors() {
  const query = useQuery({
    queryKey: doctorKeys.lists(),
    queryFn: ({ signal }) => listDoctors({ signal }),
  });

  return {
    doctors: query.data ?? [],
    loading: query.isPending,
    refreshing: query.isFetching,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useDoctor(userId) {
  const query = useQuery({
    queryKey: doctorKeys.detail(userId),
    queryFn: ({ signal }) => getDoctor(userId, { signal }),
    enabled: userId !== null && userId !== undefined && userId !== "",
  });

  return {
    doctor: query.data ?? null,
    loading: query.isPending,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => updateDoctor(userId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({
        queryKey: doctorKeys.detail(variables.userId),
      });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  });
}