import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "../api/prescriptionsApi";

const prescriptionKey = ["prescriptions"];

export function usePrescriptions(params = {}) {
  const query = useQuery({
    queryKey: [...prescriptionKey, params],
    queryFn: () => getPrescriptions(params),
  });

  return {
    prescriptions: query.data?.prescriptions || [],
    metadata: query.data?.metadata || null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function usePrescription(prescriptionId) {
  const query = useQuery({
    queryKey: [...prescriptionKey, "detail", prescriptionId],
    queryFn: () => getPrescription(prescriptionId),
    enabled: Boolean(prescriptionId),
  });

  return {
    prescription: query.data?.prescription || null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescription,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: prescriptionKey }),
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prescriptionId, prescriptionData }) =>
      updatePrescription(prescriptionId, prescriptionData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: prescriptionKey }),
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrescription,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: prescriptionKey }),
  });
}