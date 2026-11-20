import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  updateAppointment,
} from "../api/appointmentsApi";

export function useAppointments(params = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments(params);
      setAppointments(
        data?.appointments ??
        data?.data ??
        (Array.isArray(data) ? data : []),
      );
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutate = useCallback(async (action) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await action();
      await refresh();
      return result;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  return {
    appointments,
    loading,
    actionLoading,
    error: error?.message ?? error,
    refresh,
    createAppointment: (payload) =>
      mutate(() => createAppointment(payload)),
    updateAppointment: (appointmentId, payload) =>
      mutate(() => updateAppointment(appointmentId, payload)),
    removeAppointment: (appointmentId) =>
      mutate(() => cancelAppointment(appointmentId)),
  };
}

export default useAppointments;
