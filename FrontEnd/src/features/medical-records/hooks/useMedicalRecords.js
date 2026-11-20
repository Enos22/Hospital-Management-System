import { useState, useEffect, useCallback } from "react";

import {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientMedicalHistory,
} from "../api/medicalRecordsApi";

// Fetch all medical records
export const useMedicalRecords = (params = {}) => {
  const [records, setRecords] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMedicalRecords(JSON.parse(paramsKey));

      setRecords(result?.medical_records || []);
      setMetadata(result?.metadata || null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    records,
    metadata,
    isLoading,
    error,
    refresh,
  };
};

// Fetch one medical record
export const useMedicalRecord = (recordId) => {
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(recordId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordId) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchRecord = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getMedicalRecord(recordId);

        if (active) {
          setRecord(result?.medical_record || null);
        }
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchRecord();

    return () => {
      active = false;
    };
  }, [recordId]);

  return { record, isLoading, error };
};

// Fetch a patient's medical history
export const usePatientMedicalHistory = (patientId) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    let active = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPatientMedicalHistory(patientId);

        if (active) {
          setHistory(result?.medical_history || []);
        }
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [patientId]);

  return { history, isLoading, error };
};

// Create a medical record
export const useCreateMedicalRecord = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = async (recordData) => {
    setIsLoading(true);
    setError(null);

    try {
      return await createMedicalRecord(recordData);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
};

// Update a medical record
export const useUpdateMedicalRecord = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = async ({ recordId, recordData }) => {
    setIsLoading(true);
    setError(null);

    try {
      return await updateMedicalRecord(recordId, recordData);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
};

// Delete a medical record (backend admin-only)
export const useDeleteMedicalRecord = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = async (recordId) => {
    setIsLoading(true);
    setError(null);

    try {
      return await deleteMedicalRecord(recordId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading, error };
};