import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getLaboratoryTests,
  getLaboratoryTest,
  createLaboratoryTest,
  updateLaboratoryTest,
} from "../api/laboratoryApi";

// Fetch all laboratory tests
export const useLaboratoryTests = (params = {}) => {
  const query = useQuery({
    queryKey: ["laboratory-tests", params],
    queryFn: () => getLaboratoryTests(params),
  });

  return {
    tests: query.data?.laboratory_tests || [],
    metadata: query.data?.metadata || null,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
};

// Fetch one laboratory test
export const useLaboratoryTest = (testId) => {
  const query = useQuery({
    queryKey: ["laboratory-tests", testId],
    queryFn: () => getLaboratoryTest(testId),
    enabled: Boolean(testId),
  });

  return {
    test: query.data?.laboratory_test || null,
    isLoading: query.isLoading,
    error: query.error,
  };
};

// Create a laboratory test
export const useCreateLaboratoryTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLaboratoryTest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["laboratory-tests"],
      });
    },
  });
};

// Update a laboratory test
export const useUpdateLaboratoryTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, testData }) =>
      updateLaboratoryTest(testId, testData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["laboratory-tests"],
      });
    },
  });
};