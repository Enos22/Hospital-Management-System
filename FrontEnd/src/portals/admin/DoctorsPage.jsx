import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { getApiUrl, getToken } from '../../lib/api/client';
import DetailList from '../../components/feedback/DetailList';

async function apiRequest(path, options = {}) {
  const token = getToken();

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

function getDoctorList(response) {
  const result = response?.doctors ?? response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.doctors)) return result.doctors;

  return [];
}

function getDoctorId(doctor) {
  return doctor.id ?? doctor.doctor_id;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialitiesLoading, setSpecialitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSpecialityForm, setShowSpecialityForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      try {
        setLoading(true);
        setError('');

        const response = await apiRequest('/api/doctors', {
          signal: controller.signal,
        });

        setDoctors(getDoctorList(response));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load doctors.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDoctors();
    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSpecialities() {
      try {
        setSpecialitiesLoading(true);
        const response = await apiRequest('/api/specialities', {
          signal: controller.signal,
        });
        setSpecialities(Array.isArray(response) ? response : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load specialities.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSpecialitiesLoading(false);
        }
      }
    }

    loadSpecialities();
    return () => controller.abort();
  }, []);

  async function handleAddDoctor(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const newDoctor = {
      username: form.get('username').trim(),
      speciality_id: Number(form.get('speciality_id')),
      ...(form.get('email').trim() && { email: form.get('email').trim() }),
      ...(form.get('password') && { password: form.get('password') }),
    };

    setError('');
    setMessage('');

    try {
      await apiRequest('/api/doctors', {
        method: 'POST',
        body: JSON.stringify(newDoctor),
      });

      formElement.reset();
      setShowCreateForm(false);
      setMessage('Doctor added.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not add doctor.');
    }
  }

  async function handleAddSpeciality(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = form.get('speciality_name').trim();
    const description = form.get('speciality_description').trim();

    setError('');
    setMessage('');

    try {
      const speciality = await apiRequest('/api/specialities', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setSpecialities((current) =>
        [...current, speciality].sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowSpecialityForm(false);
      setMessage(`Speciality "${speciality.name}" added.`);
      formElement.reset();
    } catch (err) {
      setError(err.message || 'Could not add speciality.');
    }
  }

  async function handleViewDoctor(doctor) {
    const id = getDoctorId(doctor);

    if (!id) {
      setError('This doctor record does not include an ID for viewing.');
      return;
    }

    setError('');
    setDoctorDetails(null);

    try {
      const response = await apiRequest(`/api/doctors/${id}`);
      setDoctorDetails(response?.data ?? response);
    } catch (err) {
      setError(err.message || 'Could not load doctor details.');
    }
  }

  async function handleUpdateDoctor(event) {
    event.preventDefault();

    const id = getDoctorId(editingDoctor);
    if (!id) {
      setError('This doctor record does not include an ID for updating.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const username = form.get('username').trim();
    const email = form.get('email').trim();
    const specialityId = form.get('speciality_id');
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (specialityId) updates.speciality_id = Number(specialityId);

    if (Object.keys(updates).length === 0) {
      setError('Enter a username, email, or speciality to update.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/doctors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      setEditingDoctor(null);
      setMessage('Doctor updated.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not update doctor.');
    }
  }

  async function handleDeleteDoctor(doctor) {
    const id = getDoctorId(doctor);

    if (!id) {
      setError('This doctor record does not include an ID for deletion.');
      return;
    }

    const confirmation = window.prompt(
      `Type DELETE to remove ${doctor.username ?? 'this doctor'}:`
    );

    if (confirmation !== 'DELETE') {
      setMessage('Deletion was not confirmed.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      setDoctorDetails(null);
      setEditingDoctor(null);
      setMessage('Doctor deleted.');
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || 'Could not delete doctor.');
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const searchableText = [
      doctor.username,
      doctor.email,
      doctor.specialty,
      doctor.speciality,
      doctor.speciality_id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  return (
    <section>
      <h1>Doctors</h1>

      <label>
        Search doctors:{' '}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, or specialty"
        />
      </label>

      <button
        type="button"
        onClick={() => setRefreshKey((value) => value + 1)}
        disabled={loading}
      >
        Refresh list
      </button>

      <button
        type="button"
        onClick={() => setShowCreateForm((visible) => !visible)}
      >
        {showCreateForm ? 'Close form' : 'Add doctor'}
      </button>
      <button
        type="button"
        onClick={() => setShowSpecialityForm((visible) => !visible)}
      >
        {showSpecialityForm ? 'Close speciality form' : 'Add speciality'}
      </button>

      {showSpecialityForm && (
        <form onSubmit={handleAddSpeciality}>
          <h2>Add speciality</h2>
          <label>
            Name
            <input name="speciality_name" required maxLength={100} />
          </label>
          <label>
            Description
            <textarea name="speciality_description" />
          </label>
          <button type="submit">Save speciality</button>
        </form>
      )}

      {showCreateForm && (
        <form onSubmit={handleAddDoctor}>
          <h2>Create or link doctor profile</h2>
          <p>
            Enter the username of an existing doctor account to link it, or
            provide an email and password to create a new account.
          </p>

          <label>
            Username
            <input name="username" required />
          </label>

          <label>
            Email (required for a new account)
            <input name="email" type="email" />
          </label>

          <label>
            Password (required for a new account)
            <input name="password" type="password" minLength={8} />
          </label>

          <label>
            Specialty
            <select
              name="speciality_id"
              required
              defaultValue=""
              disabled={specialitiesLoading || specialities.length === 0}
            >
              <option value="" disabled>
                {specialitiesLoading ? 'Loading specialities...' : 'Select specialty'}
              </option>
              {specialities.map((speciality) => (
                <option key={speciality.id} value={speciality.id}>
                  {speciality.name}
                </option>
              ))}
            </select>
          </label>

          {specialities.length === 0 && !specialitiesLoading && (
            <p role="alert">
              No specialities are available. Run the backend specialty seed
              before creating or linking a doctor profile.
            </p>
          )}

          <button
            type="submit"
            disabled={specialitiesLoading || specialities.length === 0}
          >
            Save doctor profile
          </button>
        </form>
      )}

      {loading && <p>Loading doctors...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {!loading && filteredDoctors.length === 0 && (
        <p>No doctors found.</p>
      )}

      {filteredDoctors.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor, index) => (
              <tr key={getDoctorId(doctor) ?? index}>
                <td>{getDoctorId(doctor) ?? '—'}</td>
                <td>{doctor.username ?? doctor.name ?? '—'}</td>
                <td>{doctor.email ?? '—'}</td>
                <td>
                  {doctor.specialty ??
                    doctor.speciality ??
                    doctor.speciality_id ??
                    (doctor.doctor_id == null ? 'Profile not linked' : '—')}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleViewDoctor(doctor)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(doctor)}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDoctor(doctor)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingDoctor && (
        <form onSubmit={handleUpdateDoctor}>
          <h2>Update doctor</h2>

          <label>
            Username
            <input
              name="username"
              defaultValue={editingDoctor.username ?? ''}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              defaultValue={editingDoctor.email ?? ''}
            />
          </label>

          <label>
            Speciality
            <select
              name="speciality_id"
              defaultValue={editingDoctor.speciality_id ?? ''}
              disabled={specialitiesLoading || specialities.length === 0}
            >
              <option value="" disabled>
                {specialitiesLoading
                  ? 'Loading specialities...'
                  : 'Select speciality'}
              </option>
              {specialities.map((speciality) => (
                <option key={speciality.id} value={speciality.id}>
                  {speciality.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Save changes</button>
          <button type="button" onClick={() => setEditingDoctor(null)}>
            Close
          </button>
        </form>
      )}

      {doctorDetails && (
        <section>
          <h2>Doctor details</h2>
          <DetailList data={doctorDetails} />
          <button type="button" onClick={() => setDoctorDetails(null)}>
            Close details
          </button>
        </section>
      )}
    </section>
  );
}