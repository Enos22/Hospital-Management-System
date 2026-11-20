import { useState, useEffect, useCallback } from "react";

import {
  getLaboratoryTests,
  getLaboratoryTest,
  createLaboratoryTest,
  updateLaboratoryTest,
} from "../api/laboratoryApi";

export function useLaboratoryTests(params = {}) {
  const [tests, setTests] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getLaboratoryTests(JSON.parse(paramsKey));
      setTests(data.laboratory_tests || []);
      setMetadata(data.metadata || null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tests, metadata, isLoading, error, refresh };
}

export function useLaboratoryTest(testId) {
  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(testId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!testId) {
      setTest(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLaboratoryTest(testId);
      setTest(data.laboratory_test || null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { test, isLoading, error, refresh };
}

function useLaboratoryMutation(action) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      return await action(data);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
}

export function useCreateLaboratoryTest() {
  return useLaboratoryMutation(createLaboratoryTest);
}

export function useUpdateLaboratoryTest() {
  return useLaboratoryMutation(({ testId, testData }) =>
    updateLaboratoryTest(testId, testData)
  );
}