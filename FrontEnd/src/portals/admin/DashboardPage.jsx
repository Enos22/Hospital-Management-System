import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const token = sessionStorage.getItem('access_token');

        const response = await fetch('/api/admin/dashboard', {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(
              data,
              `Could not load dashboard (${response.status})`
            )
          );
        }

        setDashboardData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load dashboard data.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <section>
      <h1>Dashboard</h1>

      <button
        type="button"
        onClick={() => setRefreshKey((current) => current + 1)}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh data'}
      </button>

      {error && <p role="alert">{error}</p>}

      {dashboardData && (
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      )}
    </section>
  );
}