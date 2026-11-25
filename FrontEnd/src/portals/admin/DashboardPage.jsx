import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api/client";
import { ROUTES } from "../../app/navigation/routePaths";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/api/admin/dashboard");
        const data = response?.data ?? response;

        if (active) setDashboardData(data);
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load dashboard data.");
          setDashboardData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const stats = [
    { label: "Total users", value: dashboardData?.total_users, path: ROUTES.ADMIN.USERS },
    { label: "Total patients", value: dashboardData?.total_patients, path: ROUTES.ADMIN.PATIENTS },
    { label: "Total doctors", value: dashboardData?.total_doctors, path: ROUTES.ADMIN.DOCTORS },
    { label: "Total admins", value: dashboardData?.total_admins, path: `${ROUTES.ADMIN.USERS}?role=admin` },
  ];

  return (
    <section className="admin-dashboard">
      <header className="page-header dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of hospital user activity</p>
        </div>
        <button
          className="admin-dashboard__refresh"
          type="button"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh data"}
        </button>
      </header>

      {error && (
        <p className="admin-dashboard__error" role="alert">
          {error}
        </p>
      )}

      {loading && !dashboardData ? (
        <div className="admin-dashboard__grid" aria-label="Loading dashboard">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="admin-dashboard__card admin-dashboard__card--loading"
              key={item}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : dashboardData ? (
        <div className="admin-dashboard__grid">
          {stats.map((stat) => (
            <button
              className="admin-dashboard__card"
              type="button"
              key={stat.label}
              onClick={() => navigate(stat.path)}
              aria-label={`View ${stat.label.toLowerCase()}`}
            >
              <span className="admin-dashboard__label">{stat.label}</span>
              <strong className="admin-dashboard__value">
                {Number.isFinite(Number(stat.value)) ? Number(stat.value) : 0}
              </strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
