import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { getApiUrl } from '../../lib/api/client';

const endpoints = {
  invoices: '/api/billing/invoices',
  outstanding: '/api/billing/outstanding',
  revenue: '/api/reports/revenue',
  payments: '/api/reports/payments',
};

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('access_token');

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Request failed (${response.status})`)
    );
  }

  return data;
}

function getRows(payload) {
  const result = payload?.invoices ?? payload?.data ?? payload;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.invoices)) return result.invoices;
  if (Array.isArray(result?.items)) return result.items;

  return [];
}

function getInvoiceId(invoice) {
  return invoice.id ?? invoice.invoice_id;
}

function formatMoney(value) {
  if (value == null) return '—';

  const amount = Number(value);
  return Number.isNaN(amount) ? value : `KSh ${amount.toLocaleString()}`;
}

export default function BillingPage() {
  const [view, setView] = useState('invoices');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [formMode, setFormMode] = useState('');
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBillingData() {
      try {
        setLoading(true);
        setError('');
        setPayload(null);

        const data = await apiRequest(endpoints[view], {
          signal: controller.signal,
        });

        setPayload(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load billing data.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBillingData();
    return () => controller.abort();
  }, [view, refreshKey]);

  function selectView(nextView) {
    setView(nextView);
    setFormMode('');
    setInvoiceDetails(null);
    setError('');
    setMessage('');
  }

  async function handleCreateInvoice(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const invoice = {
      patient_id: Number(form.get('patient_id')),
      items: [
        {
          description: form.get('description'),
          quantity: Number(form.get('quantity')),
          unit_price: Number(form.get('unit_price')),
        },
      ],
    };

    setError('');
    setMessage('');

    try {
      await apiRequest('/api/billing/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice),
      });

      formElement.reset();
      setFormMode('');
      setMessage('Invoice created.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not create the invoice.');
    }
  }

  async function handleViewInvoice(invoiceId) {
    setError('');
    setMessage('');
    setInvoiceDetails(null);

    try {
      const data = await apiRequest(`/api/billing/invoices/${invoiceId}`);
      setInvoiceDetails(data?.data ?? data);
    } catch (err) {
      setError(err.message || 'Could not load invoice details.');
    }
  }

  async function handleCancelInvoice(invoiceId) {
    const confirmation = window.prompt(
      'Type CANCEL INVOICE to confirm:'
    );

    if (confirmation !== 'CANCEL INVOICE') {
      setMessage('Invoice cancellation was not confirmed.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/billing/invoices/${invoiceId}/cancel`, {
        method: 'POST',
      });

      setMessage('Invoice cancelled.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not cancel the invoice.');
    }
  }

  async function handleRecordPayment(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const payment = {
      amount: Number(form.get('amount')),
      method: form.get('method'),
    };

    setError('');
    setMessage('');

    try {
      await apiRequest(
        `/api/billing/invoices/${activeInvoiceId}/payments`,
        {
          method: 'POST',
          body: JSON.stringify(payment),
        }
      );

      formElement.reset();
      setFormMode('');
      setMessage('Payment recorded.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not record the payment.');
    }
  }

  const invoices = getRows(payload);

  return (
    <section>
      <h1>Billing and reports</h1>

      <nav aria-label="Billing sections">
        <button type="button" onClick={() => selectView('invoices')}>
          Invoices
        </button>
        <button type="button" onClick={() => selectView('outstanding')}>
          Outstanding invoices
        </button>
        <button type="button" onClick={() => selectView('revenue')}>
          Revenue report
        </button>
        <button type="button" onClick={() => selectView('payments')}>
          Payments report
        </button>
      </nav>

      {view === 'invoices' && (
        <button
          type="button"
          onClick={() => setFormMode(formMode === 'create' ? '' : 'create')}
        >
          Create invoice
        </button>
      )}

      <button
        type="button"
        onClick={() => setRefreshKey((value) => value + 1)}
        disabled={loading}
      >
        Refresh
      </button>

      {formMode === 'create' && (
        <form onSubmit={handleCreateInvoice}>
          <h2>Create invoice</h2>

          <label>
            Patient profile ID (not the patient account ID)
            <input name="patient_id" type="number" min="1" required />
          </label>

          <label>
            Item description
            <input name="description" required />
          </label>

          <label>
            Quantity
            <input name="quantity" type="number" min="1" defaultValue="1" required />
          </label>

          <label>
            Unit price
            <input name="unit_price" type="number" min="0" step="0.01" required />
          </label>

          <button type="submit">Save invoice</button>
          <button type="button" onClick={() => setFormMode('')}>
            Close
          </button>
        </form>
      )}

      {formMode === 'payment' && (
        <form onSubmit={handleRecordPayment}>
          <h2>Record payment for invoice {activeInvoiceId}</h2>

          <label>
            Amount
            <input name="amount" type="number" min="0.01" step="0.01" required />
          </label>

          <label>
            Payment method
            <select name="method" required defaultValue="cash">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile money</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="insurance">Insurance</option>
            </select>
          </label>

          <button type="submit">Record payment</button>
          <button type="button" onClick={() => setFormMode('')}>
            Close
          </button>
        </form>
      )}

      {loading && <p>Loading billing data...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {(view === 'invoices' || view === 'outstanding') && !loading && (
        <>
          {invoices.length === 0 ? (
            <p>No invoices found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => {
                  const id = getInvoiceId(invoice);

                  return (
                    <tr key={id ?? index}>
                      <td>{id ?? '—'}</td>
                      <td>
                        {invoice.patient_name ??
                          invoice.patient_id ??
                          '—'}
                      </td>
                      <td>
                        {formatMoney(
                          invoice.total_amount ??
                            invoice.amount ??
                            invoice.balance
                        )}
                      </td>
                      <td>{invoice.status ?? '—'}</td>
                      <td>
                        {id && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleViewInvoice(id)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelInvoice(id)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveInvoiceId(id);
                                setFormMode('payment');
                              }}
                            >
                              Record payment
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {invoiceDetails && (
        <section>
          <h2>Invoice details</h2>
          <pre>{JSON.stringify(invoiceDetails, null, 2)}</pre>
          <button type="button" onClick={() => setInvoiceDetails(null)}>
            Close details
          </button>
        </section>
      )}

      {(view === 'revenue' || view === 'payments') && payload && (
        <section>
          <h2>{view === 'revenue' ? 'Revenue report' : 'Payments report'}</h2>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </section>
      )}
    </section>
  );
}