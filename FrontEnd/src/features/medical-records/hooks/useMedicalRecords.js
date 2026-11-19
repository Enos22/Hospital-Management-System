import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMedicalRecords,
  getMedicalRecord,
  getPatientMedicalHistory,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../api/medicalRecordsApi";

const medicalRecordsKey = ["medical-records"];

export function useMedicalRecords(params = {}) {
  const query = useQuery({
    queryKey: [...medicalRecordsKey, params],
    queryFn: () => getMedicalRecords(params),
  });

  return {
    records: query.data?.medical_records || [],
    metadata: query.data?.metadata || null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useMedicalRecord(recordId) {
  const query = useQuery({
    queryKey: [...medicalRecordsKey, "detail", recordId],
    queryFn: () => getMedicalRecord(recordId),
    enabled: Boolean(recordId),
  });

  return {
    record: query.data?.medical_record || null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function usePatientMedicalHistory(patientId) {
  const query = useQuery({
    queryKey: [...medicalRecordsKey, "history", patientId],
    queryFn: () => getPatientMedicalHistory(patientId),
    enabled: Boolean(patientId),
  });

  return {
    history: query.data?.medical_history || [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalRecordsKey,
      });
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, recordData }) =>
      updateMedicalRecord(recordId, recordData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalRecordsKey,
      });
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalRecordsKey,
      });
    },
  });
}