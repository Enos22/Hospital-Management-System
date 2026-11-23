/*
 * TODO: Present account listing and supported user-role management.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getToken } from "../../lib/api/client";

const API_BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") ?? "";
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [userId, setUserId] = useState("");
  const [newRole, setNewRole] = useState("doctor");

  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function apiRequest(path, options = {}) {
    if (!API_BASE_URL && !import.meta.env.DEV) {
      throw new Error("VITE_API_BASE_URL is missing from the frontend .env file.");
    }

    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
        (Array.isArray(data?.errors) ? data.errors.join(" ") : null) ||
          `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function loadUsers(event) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const query = roleFilter
        ? `?role=${encodeURIComponent(roleFilter)}`
        : "";
      const data = await apiRequest(`/api/admin/users${query}`);
      setUsers(data);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(event) {
    event.preventDefault();

    if (!userId.trim()) {
      setError("Enter a user ID.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        `/api/admin/users/${encodeURIComponent(userId.trim())}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        }
      );

      setMessage("User role updated.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not update the user's role.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser() {
    if (!userId.trim()) {
      setError("Enter a user ID.");
      return;
    }

    if (window.prompt('Type "DELETE" to confirm deleting this user:') !== "DELETE") {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        `/api/admin/users/${encodeURIComponent(userId.trim())}`,
        { method: "DELETE" }
      );

      setMessage("User deleted.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not delete the user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // Load the list again when the role filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const userList = Array.isArray(users)
    ? users
    : Array.isArray(users?.users)
      ? users.users
      : [];
  const totalUsers = Array.isArray(users) ? users.length : users?.total ?? userList.length;

  function selectUser(user) {
    setUserId(String(user.id));
    setNewRole(user.role ?? "doctor");
    setError("");
    setMessage(`User ${user.username ?? user.id} selected for management.`);
  }

  return (
    <main className="admin-users-page">
      <h1>Users</h1>
      <p>View accounts and manage user roles.</p>

      <section className="admin-users-list">
        <div
          className="admin-users-list-heading"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>All accounts</h2>
            <p style={{ margin: "5px 0 0", color: "#68758a", fontSize: "0.88rem" }}>
              {loading
                ? "Loading accounts…"
                : `${totalUsers} ${totalUsers === 1 ? "account" : "accounts"}${roleFilter ? ` · ${roleFilter}` : ""}`}
            </p>
          </div>
          <form
            onSubmit={loadUsers}
            style={{
              display: "flex",
              alignItems: "end",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label>
              <span>Filter by role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="billing">Billing</option>
              </select>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </form>
        </div>

        {users !== null && userList.length > 0 && (
          <div className="admin-users-table-wrap" style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => {
                  const role = user.role ?? "unknown";
                  const roleColors = {
                    admin: { background: "#edf1ff", color: "#354fae" },
                    doctor: { background: "#f1effb", color: "#6655a7" },
                    patient: { background: "#fff5e8", color: "#99642c" },
                    billing: { background: "#edf4ff", color: "#3d6399" },
                  };
                  const roleStyle = roleColors[role] ?? {
                    background: "#f1f3f7",
                    color: "#59667d",
                  };

                  return (
                    <tr key={user.id ?? user.email ?? index}>
                      <td>
                        <strong
                          className="admin-user-name"
                          style={{ display: "block", color: "#202b3d" }}
                        >
                          {user.username ?? "Unnamed account"}
                        </strong>
                        <span
                          className="admin-user-id"
                          style={{ display: "block", marginTop: "3px", color: "#8a96a8", fontSize: "0.75rem" }}
                        >
                          ID: {user.id ?? "—"}
                        </span>
                      </td>
                      <td>{user.email ?? "—"}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            background: roleStyle.background,
                            color: roleStyle.color,
                            fontSize: "0.75rem",
                            fontWeight: 750,
                            textTransform: "capitalize",
                          }}
                        >
                          {role}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-user-select"
                          style={{
                            minHeight: "32px",
                            padding: "6px 10px",
                            border: "1px solid #d5dcf2",
                            borderRadius: "8px",
                            background: "#f5f6ff",
                            color: "#354fae",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                          onClick={() => selectUser(user)}
                          disabled={user.id == null}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {users !== null && userList.length === 0 && !loading && (
          <p className="admin-users-empty">No accounts match this filter.</p>
        )}
      </section>

      <section>
        <h2>Change a user’s role</h2>
        <p>Choose Manage in the account list to fill in a user ID and current role.</p>
        <form onSubmit={changeRole}>
          <label>
            User ID
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />
          </label>

          <label>
            New role
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            Update role
          </button>
        </form>
      </section>

      <section>
        <h2>Delete a user</h2>
        <p>
          Select an account with Manage or enter its ID. Only standalone
          accounts without linked patient or doctor profiles or payment history
          can be deleted.
        </p>
        <label>
          User ID
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
          />
        </label>

        <button type="button" onClick={deleteUser} disabled={loading}>
          Delete user
        </button>
      </section>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </main>
  );
}