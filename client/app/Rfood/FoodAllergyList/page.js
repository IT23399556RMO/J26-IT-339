
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./FoodAllergyList.css";

const emptyForm = {
  foodName: "",
  category: "",
  severity: "",
  symptoms: [],
  reactionTime: "",
  reactionDescription: "",
  dateIdentified: "",
  status: "Active",
  additionalNotes: "",
};

const symptomOptions = [
  "Itching",
  "Skin rash",
  "Swelling",
  "Stomach pain",
  "Vomiting",
  "Breathing difficulty",
  "Dizziness",
  "Other",
];

export default function FoodAllergyList() {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadAllergies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/food-allergies", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load records.");
      }

      setAllergies(data);
    } catch (err) {
      setError(err.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllergies();
  }, [loadAllergies]);

  function startEdit(item) {
    setEditingId(item.id);
    setMessage("");
    setError("");

    setForm({
      foodName: item.food_name || "",
      category: item.category || "",
      severity: item.severity || "",
      symptoms: Array.isArray(item.symptoms)
        ? item.symptoms
        : item.symptoms
          ? String(item.symptoms).split(",").map((s) => s.trim())
          : [],
      reactionTime: item.reaction_time || "",
      reactionDescription: item.reaction_description || "",
      dateIdentified: item.date_identified
        ? String(item.date_identified).slice(0, 10)
        : "",
      status: item.status || "Active",
      additionalNotes: item.additional_notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function toggleSymptom(symptom) {
    setForm((previous) => ({
      ...previous,
      symptoms: previous.symptoms.includes(symptom)
        ? previous.symptoms.filter((item) => item !== symptom)
        : [...previous.symptoms, symptom],
    }));
  }

  async function saveEdit(event) {
    event.preventDefault();

    if (!form.foodName.trim() || !form.category || !form.severity) {
      setError("Food name, category and severity are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/food-allergies/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update record.");
      }

      setMessage("Food allergy updated successfully.");
      setEditingId(null);
      setForm(emptyForm);
      await loadAllergies();
    } catch (err) {
      setError(err.message || "Unable to update record.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.food_name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/food-allergies/${item.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete record.");
      }

      if (editingId === item.id) cancelEdit();

      setMessage("Food allergy deleted successfully.");
      await loadAllergies();
    } catch (err) {
      setError(err.message || "Unable to delete record.");
    }
  }

  const filteredAllergies = allergies.filter((item) => {
    const query = search.toLowerCase();

    return [
      item.food_name,
      item.category,
      item.severity,
      item.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="allergy-list-page">
      <header className="allergy-list-header">
        <div>
          <h1>Manage Food Allergies</h1>
          <p>View, edit and delete your saved allergy records.</p>
        </div>

        <Link className="add-allergy-link" href="/Rfood/FoodAllergy">
          + Add Food Allergy
        </Link>
      </header>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {editingId !== null && (
        <form className="edit-allergy-form" onSubmit={saveEdit}>
          <h2>Edit Food Allergy</h2>

          <div className="allergy-form-grid">
            <label>
              Food Name *
              <input
                name="foodName"
                value={form.foodName}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Category *
              <input
                name="category"
                value={form.category}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Severity *
              <select
                name="severity"
                value={form.severity}
                onChange={updateField}
                required
              >
                <option value="">Select severity</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>
            </label>

            <label>
              Reaction Time
              <input
                name="reactionTime"
                value={form.reactionTime}
                onChange={updateField}
                placeholder="e.g. 30 minutes"
              />
            </label>

            <label>
              Date Identified
              <input
                type="date"
                name="dateIdentified"
                value={form.dateIdentified}
                onChange={updateField}
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={updateField}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          <fieldset className="symptoms-fieldset">
            <legend>Symptoms</legend>

            <div className="symptom-options">
              {symptomOptions.map((symptom) => (
                <label key={symptom} className="symptom-option">
                  <input
                    type="checkbox"
                    checked={form.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="full-width-label">
            Reaction Description
            <textarea
              name="reactionDescription"
              value={form.reactionDescription}
              onChange={updateField}
              rows={3}
            />
          </label>

          <label className="full-width-label">
            Additional Notes
            <textarea
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={updateField}
              rows={3}
            />
          </label>

          <div className="edit-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="allergy-records">
        <div className="records-heading">
          <h2>Allergy Records ({filteredAllergies.length})</h2>

          <input
            className="allergy-search"
            placeholder="Search food, category, severity..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="list-status">Loading records...</p>
        ) : filteredAllergies.length === 0 ? (
          <p className="list-status">No allergy records found.</p>
        ) : (
          <div className="allergy-table-wrapper">
            <table className="allergy-table">
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Symptoms</th>
                  <th>Date Identified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAllergies.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Food Name">
                      <strong>{item.food_name}</strong>
                    </td>
                    <td data-label="Category">{item.category}</td>
                    <td data-label="Severity">
                      <span
                        className={`severity-badge severity-${String(
                          item.severity || ""
                        ).toLowerCase()}`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td data-label="Symptoms">
                      {Array.isArray(item.symptoms)
                        ? item.symptoms.join(", ")
                        : item.symptoms || "—"}
                    </td>
                    <td data-label="Date Identified">
                      {item.date_identified
                        ? String(item.date_identified).slice(0, 10)
                        : "—"}
                    </td>
                    <td data-label="Status">{item.status || "—"}</td>
                    <td data-label="Actions">
                      <div className="record-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteRecord(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
