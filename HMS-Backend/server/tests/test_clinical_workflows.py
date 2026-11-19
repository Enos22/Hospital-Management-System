def test_patient_record_laboratory_and_prescription_access(
    client, make_user, token_for
):
    doctor_user, _ = make_user("doctor", username="clinical-doctor")
    patient_user, patient = make_user("patient", username="clinical-patient")
    other_user, other_patient = make_user("patient", username="other-clinical")
    doctor = doctor_user.doctor
    doctor_headers = {"Authorization": f"Bearer {token_for(doctor_user)}"}
    patient_headers = {"Authorization": f"Bearer {token_for(patient_user)}"}
    other_headers = {"Authorization": f"Bearer {token_for(other_user)}"}

    record_response = client.post(
        "/api/medical-records",
        headers=doctor_headers,
        json={
            "patient_id": patient.id,
            "diagnosis": "Seasonal allergy",
            "treatment": "Antihistamine",
        },
    )
    assert record_response.status_code == 201
    record_id = record_response.get_json()["medical_record"]["id"]

    own_record = client.get(
        f"/api/medical-records/{record_id}", headers=patient_headers
    )
    assert own_record.status_code == 200
    denied_record = client.get(
        f"/api/medical-records/{record_id}", headers=other_headers
    )
    assert denied_record.status_code == 403

    medicine_response = client.post(
        "/api/pharmacy/medicines",
        headers={"Authorization": f"Bearer {token_for(make_user('admin')[0])}"},
        json={"name": "Allergy tablet", "price": 12.5, "stock_quantity": 20},
    )
    assert medicine_response.status_code == 201
    medicine_id = medicine_response.get_json()["medicine"]["id"]

    prescription_response = client.post(
        "/api/prescriptions",
        headers=doctor_headers,
        json={
            "patient_id": patient.id,
            "doctor_id": doctor.id,
            "medicine_id": medicine_id,
            "dosage": "1 tablet",
            "frequency": "Daily",
            "duration": "5 days",
        },
    )
    assert prescription_response.status_code == 201
    prescription_id = prescription_response.get_json()["prescription"]["id"]
    own_prescription = client.get(
        f"/api/prescriptions/{prescription_id}", headers=patient_headers
    )
    assert own_prescription.status_code == 200
    denied_prescription = client.get(
        f"/api/prescriptions/{prescription_id}", headers=other_headers
    )
    assert denied_prescription.status_code == 403

    lab_response = client.post(
        "/api/laboratory/tests",
        headers=doctor_headers,
        json={
            "patient_id": patient.id,
            "doctor_id": doctor.id,
            "test_name": "Blood count",
        },
    )
    assert lab_response.status_code == 201
    test_id = lab_response.get_json()["laboratory_test"]["id"]

    lab_result = client.patch(
        f"/api/laboratory/tests/{test_id}",
        headers=doctor_headers,
        json={"result": "Within expected range"},
    )
    assert lab_result.status_code == 200
    assert lab_result.get_json()["laboratory_test"]["status"] == "Completed"

    own_lab = client.get(
        f"/api/laboratory/tests/{test_id}", headers=patient_headers
    )
    assert own_lab.status_code == 200
    assert own_lab.get_json()["laboratory_test"]["result"] == "Within expected range"
    denied_lab = client.get(
        f"/api/laboratory/tests/{test_id}", headers=other_headers
    )
    assert denied_lab.status_code == 403


def test_medicine_stock_can_be_updated(client, make_user, token_for):
    admin, _ = make_user("admin")
    headers = {"Authorization": f"Bearer {token_for(admin)}"}
    create = client.post(
        "/api/pharmacy/medicines",
        headers=headers,
        json={"name": "Pain reliever", "price": 5.0, "stock_quantity": 10},
    )
    assert create.status_code == 201
    medicine_id = create.get_json()["medicine"]["id"]

    update = client.patch(
        f"/api/pharmacy/medicines/{medicine_id}",
        headers=headers,
        json={"stock_quantity": 7},
    )
    assert update.status_code == 200
    assert update.get_json()["medicine"]["stock_quantity"] == 7

    invalid = client.patch(
        f"/api/pharmacy/medicines/{medicine_id}",
        headers=headers,
        json={"stock_quantity": -1},
    )
    assert invalid.status_code == 400
