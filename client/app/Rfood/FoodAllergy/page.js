"use client";

import { useState } from "react";
import "./FoodAllergy.css";

const initialForm = {
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
];

export default function FoodAllergy() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSymptomChange = (symptom) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((item) => item !== symptom)
        : [...prev.symptoms, symptom],
    }));
    setSuccess(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.foodName || !form.category || !form.severity) {
    alert("Please complete all required fields.");
    return;
  }

  try {
    const response = await fetch("/api/food-allergies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save allergy.");
    }

    setSuccess(true);
    setForm({ ...initialForm });

  } catch (error) {
    console.error("Error saving allergy:", error);
    alert(error.message || "Unable to save food allergy.");
  }
};

  return (
    <main className="allergy-page">
      <div className="allergy-container">
        <header className="allergy-header">
          <div className="header-icon">♥</div>
          <div>
            <h1>Food Allergy Information</h1>
            <p>
              Add the foods you are allergic to and record your reaction
              details.
            </p>
          </div>
        </header>

        {success && (
          <div className="success-message">
            <span>✓</span>
            <div>
              <strong>Food allergy saved successfully</strong>
              <p>Your allergy information has been recorded.</p>
            </div>
          </div>
        )}

        <form className="allergy-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="foodName">
              🍽️ Food Name <span>*</span>
            </label>
            <input
              id="foodName"
              name="foodName"
              type="text"
              value={form.foodName}
              onChange={handleChange}
              placeholder="e.g. Peanut"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="category">
                🥗 Food Category <span>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option>Fruits</option>
                <option>Vegetables</option>
                <option>Nuts</option>
                <option>Dairy</option>
                <option>Seafood</option>
                <option>Meat</option>
                <option>Eggs</option>
                <option>Grains</option>
                <option>Spices</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">
                ⚠️ Severity <span>*</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                required
              >
                <option value="">Select severity</option>
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
                <option>Life-threatening</option>
              </select>

              {(form.severity === "Severe" ||
                form.severity === "Life-threatening") && (
                <div className="warning-box">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <strong>Important</strong>
                    <p>
                      This is a serious food allergy. Please make sure
                      your emergency contact and medical information are
                      available.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>🩺 Symptoms</label>
            <div className="symptoms-grid">
              {symptomOptions.map((symptom) => (
                <label
                  className={`symptom-option ${
                    form.symptoms.includes(symptom) ? "selected" : ""
                  }`}
                  key={symptom}
                >
                  <input
                    type="checkbox"
                    checked={form.symptoms.includes(symptom)}
                    onChange={() => handleSymptomChange(symptom)}
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reactionTime">⏱️ Reaction Time</label>
            <select
              id="reactionTime"
              name="reactionTime"
              value={form.reactionTime}
              onChange={handleChange}
            >
              <option value="">Select reaction time</option>
              <option>Immediately</option>
              <option>Within 15 minutes</option>
              <option>Within 30 minutes</option>
              <option>Within 1 hour</option>
              <option>More than 1 hour</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reactionDescription">
              📝 Reaction Description
            </label>
            <textarea
              id="reactionDescription"
              name="reactionDescription"
              value={form.reactionDescription}
              onChange={handleChange}
              placeholder="Describe what happened after eating this food..."
              rows="5"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="dateIdentified">📅 Date Identified</label>
              <input
                id="dateIdentified"
                name="dateIdentified"
                type="date"
                value={form.dateIdentified}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">🔵 Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Unknown</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">💬 Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={handleChange}
              placeholder="Add any additional information..."
              rows="4"
            />
          </div>

          <button type="submit" className="save-button">
            <span>✓</span>
            Save Food Allergy
          </button>
        </form>

        <p className="privacy-note">
          🔒 Your allergy information is stored securely on this device.
        </p>
      </div>
    </main>
  );
}
