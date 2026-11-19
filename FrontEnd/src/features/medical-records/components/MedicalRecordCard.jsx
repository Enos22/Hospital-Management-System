/*
 * TODO: Render a medical record without mixing user and patient profile IDs.
 */
import { useState, useEffect, useCallback } from "react";
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
} from "../api/medicalRecordsApi";

export default function useMedicalRecords(token, options = {}) {
  const { patientId = null, page = 1, perPage = 10, search = "" } = options;

  const [records, setRecords] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const resetRecords = (errorMsg = "") => {
    setRecords([]);
    setMetadata(null);
    setError(errorMsg);
  };

  const loadRecords = useCallback(async () => {
    if (!token) {
      resetRecords("Authentication token is required.");
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMedicalRecords(token, page, perPage, { patientId, search });
      const medicalRecords = response?.medical_records;

      if (!Array.isArray(medicalRecords)) {
        throw new Error("Invalid medical record data received.");
      }

      setRecords(medicalRecords);
      setMetadata(response.metadata ?? null);
      return medicalRecords;
    } catch (err) {
      resetRecords(err.message || "Unable to load medical records.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, patientId, page, perPage, search]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const runAction = async (action) => {
    setActionLoading(true);
    setError("");

    try {
      const result = await action();
      await loadRecords();
      return result;
    } catch (err) {
      setError(err.message || "Unable to complete medical record action.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    records,
    metadata,
    loading,
    actionLoading,
    error,
    refresh: loadRecords,
    getRecord: (id) => getMedicalRecordById(id, token),
    addRecord: (data) => runAction(() => createMedicalRecord(data, token)),
    editRecord: (id, updates) => runAction(() => updateMedicalRecord(id, updates, token)),
  };
}