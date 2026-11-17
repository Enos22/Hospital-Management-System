/*
 * TODO: Expose appointment queries and mutations with targeted cache updates.
 */
import { useState, useEffect, useCallback } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from "../api/appointmentsApi";

export default function useAppointments(page = 1) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAppointments(page);
      const list = Array.isArray(response) ? response : response?.appointments || response?.data;

      if (!Array.isArray(list)) {
        throw new Error("Invalid appointment data received from the server.");
      }

      setAppointments(list);
      return list;
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
      setAppointments([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Helper to wrap mutations with loading/error handling and auto-refresh
  const handleAction = async (actionFn, fallbackError) => {
    setActionLoading(true);
    setError("");
    try {
      const result = await actionFn();
      await loadAppointments();
      return result;
    } catch (err) {
      setError(err.message || fallbackError);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    appointments,
    loading,
    actionLoading,
    error,
    refresh: loadAppointments,
    addAppointment: (data) => handleAction(() => createAppointment(data), "Unable to book appointment."),
    editAppointment: (id, updates) => handleAction(() => updateAppointment(id, updates), "Unable to update appointment."),
    removeAppointment: (id) => handleAction(() => cancelAppointment(id), "Unable to cancel appointment."),
  };
}