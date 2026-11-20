/*
 * TODO: Present account listing and supported user-role management.
 */
import { useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const [userId, setUserId] = useState("");
  const [newRole, setNewRole] = useState("doctor");

  const [users, setUsers] = useState(null);
  const [latestResponse, setLatestResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function apiRequest(path, options = {}) {
    if (!API_BASE_URL) {
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
        data?.message || data?.error || `Request failed (${response.status})`
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
      setLatestResponse(data);
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

      setLatestResponse(data);
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
      const data = await apiRequest(
        `/api/admin/users/${encodeURIComponent(userId.trim())}`,
        { method: "DELETE" }
      );

      setLatestResponse(data);
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

  return (
    <main>
      <h1>Users</h1>
      <p>View accounts and manage user roles.</p>

      <section>
        <h2>List users</h2>
        <form onSubmit={loadUsers}>
          <label>
            Filter by role
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Refresh users"}
          </button>
        </form>

        {users !== null && <pre>{JSON.stringify(users, null, 2)}</pre>}
      </section>

      <section>
        <h2>Change a user’s role</h2>
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

      {latestResponse !== null && (
        <section>
          <h2>Latest response</h2>
          <pre>{JSON.stringify(latestResponse, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}