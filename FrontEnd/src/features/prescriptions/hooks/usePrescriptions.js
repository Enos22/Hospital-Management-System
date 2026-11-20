import { useState, useEffect, useCallback } from "react";

import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "../api/prescriptionsApi";

export function usePrescriptions(params = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPrescriptions(JSON.parse(paramsKey));
      setPrescriptions(data.prescriptions || []);
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

  return { prescriptions, metadata, isLoading, error, refresh };
}

export function usePrescription(prescriptionId) {
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(prescriptionId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!prescriptionId) {
      setPrescription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getPrescription(prescriptionId);
      setPrescription(data.prescription || null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [prescriptionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { prescription, isLoading, error, refresh };
}

function usePrescriptionMutation(action) {
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

export function useCreatePrescription() {
  return usePrescriptionMutation(createPrescription);
}

export function useUpdatePrescription() {
  return usePrescriptionMutation(({ prescriptionId, prescriptionData }) =>
    updatePrescription(prescriptionId, prescriptionData)
  );
}

export function useDeletePrescription() {
  return usePrescriptionMutation(deletePrescription);
}

export default usePrescriptions;