import React, { useState } from "react";

function LabTestPanel({
  tests = [],
  patients = [],
  doctors = [],
  onCreate,
  onUpdate,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    test_name: "",
  });

  const [editingTest, setEditingTest] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    result: "",
  });

  const [error, setError] = useState("");

  const getName = (item) =>
    item.name || item.full_name || item.username || `ID: ${item.id}`;

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.test_name.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await onCreate({
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        test_name: formData.test_name.trim(),
      });

      setFormData({
        patient_id: "",
        doctor_id: "",
        test_name: "",
      });
    } catch (err) {
      setError(err.message || "Unable to create laboratory test.");
    }
  };

  const startEditing = (test) => {
    setEditingTest(test.id);
    setUpdateData({
      status: test.status || "",
      result: test.result || "",
    });
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onUpdate(editingTest, updateData);
      setEditingTest(null);
    } catch (err) {
      setError(err.message || "Unable to update laboratory test.");
    }
  };

  return (
    <section className="lab-test-panel">
      <h2>Laboratory Tests</h2>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleCreate}>
        <h3>Request a Laboratory Test</h3>

        <label htmlFor="patient_id">Patient</label>
        <select
          id="patient_id"
          name="patient_id"
          value={formData.patient_id}
          onChange={handleCreateChange}
          required
        >
          <option value="">Select patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {getName(patient)}
            </option>
          ))}
        </select>

        <label htmlFor="doctor_id">Doctor</label>
        <select
          id="doctor_id"
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleCreateChange}
          required
        >
          <option value="">Select doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {getName(doctor)}
            </option>
          ))}
        </select>

        <label htmlFor="test_name">Test Name</label>
        <input
          id="test_name"
          name="test_name"
          type="text"
          value={formData.test_name}
          onChange={handleCreateChange}
          placeholder="Enter test name"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Request Test"}
        </button>
      </form>

      <hr />

      <h3>Existing Tests</h3>

      {tests.length === 0 ? (
        <p>No laboratory tests available.</p>
      ) : (
        tests.map((test) => (
          <div className="lab-test-card" key={test.id}>
            <h4>{test.test_name}</h4>
            <p><strong>Patient ID:</strong> {test.patient_id}</p>
            <p><strong>Status:</strong> {test.status || "Not provided"}</p>
            <p><strong>Result:</strong> {test.result || "Not available"}</p>

            {editingTest === test.id ? (
              <form onSubmit={handleUpdate}>
                <label htmlFor={`status-${test.id}`}>Status</label>
                <input
                  id={`status-${test.id}`}
                  type="text"
                  value={updateData.status}
                  onChange={(event) =>
                    setUpdateData((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                />

                <label htmlFor={`result-${test.id}`}>Result</label>
                <textarea
                  id={`result-${test.id}`}
                  value={updateData.result}
                  onChange={(event) =>
                    setUpdateData((previous) => ({
                      ...previous,
                      result: event.target.value,
                    }))
                  }
                />

                <button type="submit" disabled={isSubmitting}>
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => startEditing(test)}
              >
                Update Test
              </button>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default LabTestPanel;