import { useCallback, useEffect, useState } from "react";
import billingApi from "../api/billingApi";

function unwrapList(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function useInvoices(params = {}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingApi.listInvoices(params);
      setInvoices(unwrapList(data, "invoices"));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);
  useEffect(() => { refresh(); }, [refresh]);
  return {
    invoices,
    data: invoices,
    loading,
    isPending: loading,
    isLoading: loading,
    isError: Boolean(error),
    isFetching: loading,
    error: error?.message ?? error,
    refresh,
    refetch: refresh,
  };
}

export function useOutstandingInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billingApi.getOutstandingInvoices();
      setInvoices(unwrapList(data, "invoices"));
      setReport(data);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return {
    invoices,
    data: report ?? { invoices },
    outstanding: report ?? { invoices },
    loading,
    isPending: loading,
    isLoading: loading,
    isError: Boolean(error),
    isFetching: loading,
    error: error?.message ?? error,
    refresh,
    refetch: refresh,
  };
}

export function useRevenueReport(params = {}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    billingApi.getRevenueReport(params).then(setReport).catch(setError).finally(() => setLoading(false));
  }, [JSON.stringify(params)]);
  return { report, loading, error: error?.message ?? error };
}

export function usePaymentReport(params = {}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    billingApi.getPaymentReport(params).then(setReport).catch(setError).finally(() => setLoading(false));
  }, [JSON.stringify(params)]);
  return { report, loading, error: error?.message ?? error };
}

export function useCreateInvoice() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (payload) => {
    setIsPending(true);
    try { return await billingApi.createInvoice(payload); }
    finally { setIsPending(false); }
  };
  const mutate = (payload, callbacks = {}) => {
    setIsPending(true);
    billingApi.createInvoice(payload)
      .then((result) => callbacks.onSuccess?.(result))
      .catch((error) => callbacks.onError?.(error))
      .finally(() => setIsPending(false));
  };
  return { mutateAsync, mutate, isPending };
}

export function useCancelInvoice() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (invoiceId) => {
    setIsPending(true);
    try { return await billingApi.cancelInvoice(invoiceId); }
    finally { setIsPending(false); }
  };
  const mutate = (invoiceId, callbacks = {}) => {
    setIsPending(true);
    billingApi.cancelInvoice(invoiceId)
      .then((result) => callbacks.onSuccess?.(result))
      .catch((error) => callbacks.onError?.(error))
      .finally(() => setIsPending(false));
  };
  return { mutateAsync, mutate, isPending };
}

export function useRecordPayment() {
  const [isPending, setIsPending] = useState(false);
  const mutate = (payload, callbacks = {}) => {
    setIsPending(true);
    billingApi.recordPayment(payload.invoiceId, payload)
      .then((result) => callbacks.onSuccess?.(result))
      .catch((error) => callbacks.onError?.(error))
      .finally(() => setIsPending(false));
  };
  return { mutate, isPending };
}

export function usePatientBalance(patientId) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    billingApi.getPatientBalance(patientId).then(setBalance).catch(setError).finally(() => setLoading(false));
  }, [patientId]);
  return { balance, loading, error: error?.message ?? error };
}

export function useBilling(params = {}) {
  const state = useInvoices(params);
  return { ...state, loading: state.loading };
}
