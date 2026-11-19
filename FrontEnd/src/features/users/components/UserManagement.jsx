import { useState } from "react";
import { useDeleteUser, useUpdateUserRole, useUsers } from "../hooks/useUsers";
import UserRow from "./UserRow";

export default function UserManagement() {
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const { users, pagination, loading, refreshing, error, refresh } = useUsers({
    role,
    page,
    perPage: 20,
  });
  const updateRole = useUpdateUserRole();
  const removeUser = useDeleteUser();

  const mutationError = updateRole.error || removeUser.error;
  const busy = updateRole.isPending || removeUser.isPending;

  async function handleRoleUpdate(user, nextRole) {
    await updateRole.mutateAsync({ userId: user.id, role: nextRole });
  }

  async function handleDelete(user) {
    const confirmation = window.prompt(
      `Type DELETE to remove ${user.username ?? "this user"}:`
    );

    if (confirmation === "DELETE") {
      await removeUser.mutateAsync(user.id);
    }
  }

  return (
    <section>
      <h1>Users</h1>

      <label>
        Filter by role
        <select
          value={role}
          onChange={(event) => {
            setPage(1);
            setRole(event.target.value);
          }}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
          <option value="billing">Billing</option>
        </select>
      </label>

      <button type="button" onClick={() => refresh()} disabled={refreshing}>
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>

      {loading && <p>Loading users…</p>}
      {(error || mutationError) && (
        <p role="alert">{(error || mutationError).message}</p>
      )}

      {updateRole.isSuccess && <p role="status">User role updated.</p>}
      {removeUser.isSuccess && <p role="status">User deleted.</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onUpdateRole={handleRoleUpdate}
                onDelete={handleDelete}
                busy={busy}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!loading && users.length === 0 && <p>No users found.</p>}

      <div>
        <button
          type="button"
          disabled={!pagination.hasPrevious || loading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.pages || 1}
        </span>
        <button
          type="button"
          disabled={!pagination.hasNext || loading}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}