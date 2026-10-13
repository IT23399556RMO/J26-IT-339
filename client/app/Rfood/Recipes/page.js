
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./Recipes.css";

const initialForm = {
  foodName: "",
  category: "",
  description: "",
  ingredients: "",
  cookingInstructions: "",
  preparationTime: "10",
  cookingTime: "30",
  servings: "2",
};

export default function RecipesPage() {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recipes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load recipes.");
      }

      setRecipes(data);
    } catch (err) {
      setError(err.message || "Unable to load recipes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/recipes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save recipe.");
      }

      setMessage("Recipe saved successfully!");
      setForm(initialForm);
      setImage(null);

      await loadRecipes();
    } catch (err) {
      setError(err.message || "Unable to save recipe.");
    } finally {
      setSaving(false);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const query = search.trim().toLowerCase();

    return (
      recipe.food_name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="recipes-page">
      <header className="recipes-header">
        <div>
          <p className="recipes-eyebrow">YOUR FOOD COLLECTION</p>
          <h1>Food Recipe Book</h1>
          <p className="recipes-subtitle">
            Save your favourite dishes, ingredients and cooking methods.
          </p>
        </div>

        <Link href="/Rfood/FoodAllergy" className="recipes-back-link">
          Food Allergy Page
        </Link>
      </header>

      {message && (
        <div className="recipe-message recipe-success">{message}</div>
      )}

      {error && (
        <div className="recipe-message recipe-error">{error}</div>
      )}

      <section className="recipe-form-card">
        <div className="recipe-section-heading">
          <span className="recipe-step">01</span>
          <div>
            <h2>Add a New Recipe</h2>
            <p>Enter the details and upload a food photo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="recipe-form-grid">
            <label>
              Food Name *
              <input
                name="foodName"
                value={form.foodName}
                onChange={handleChange}
                placeholder="e.g. Sri Lankan Chicken Curry"
                required
              />
            </label>

            <label>
              Category *
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Rice and Curry">Rice and Curry</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Short Eats">Short Eats</option>
                <option value="Desserts">Desserts</option>
                <option value="Drinks">Drinks</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Seafood">Seafood</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Preparation Time (minutes) *
              <input
                type="number"
                name="preparationTime"
                min="0"
                step="1"
                value={form.preparationTime}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Cooking Time (minutes) *
              <input
                type="number"
                name="cookingTime"
                min="0"
                step="1"
                value={form.cookingTime}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Servings *
              <input
                type="number"
                name="servings"
                min="1"
                step="1"
                value={form.servings}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="recipe-full-label">
            Short Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the dish..."
              rows={2}
            />
          </label>

          <label className="recipe-full-label">
            Ingredients *
            <textarea
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              placeholder={"Chicken - 500g\nOnion - 1\nCoconut milk - 1 cup"}
              rows={5}
              required
            />
            <span className="recipe-field-hint">
              Add one ingredient per line, including quantities.
            </span>
          </label>

          <label className="recipe-full-label">
            Cooking Instructions *
            <textarea
              name="cookingInstructions"
              value={form.cookingInstructions}
              onChange={handleChange}
              placeholder={"1. Prepare the ingredients.\n2. Heat the pan.\n3. Cook until ready."}
              rows={6}
              required
            />
          </label>

          <div className="recipe-image-upload">
            <span className="recipe-label">Food Image</span>

            <label className="recipe-upload-box">
              {preview ? (
                <img src={preview} alt="Selected food preview" />
              ) : (
                <span className="recipe-upload-placeholder">
                  <span className="recipe-upload-icon">＋</span>
                  <strong>Choose a food photo</strong>
                  <small>JPG, PNG or WebP · Maximum 5 MB</small>
                </span>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImage(file);
                  event.target.value = "";
                }}
              />
            </label>

            {image && (
              <button
                type="button"
                className="recipe-remove-image"
                onClick={() => setImage(null)}
              >
                Remove selected image
              </button>
            )}
          </div>

          <button
            className="recipe-save-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving Recipe..." : "Save Recipe"}
          </button>
        </form>
      </section>

      <section className="recipe-collection">
        <div className="recipe-collection-heading">
          <div>
            <p className="recipes-eyebrow">YOUR COLLECTION</p>
            <h2>All Recipes ({filteredRecipes.length})</h2>
          </div>

          <input
            className="recipe-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipes..."
            aria-label="Search recipes"
          />
        </div>

        {loading ? (
          <p className="recipe-empty">Loading recipes...</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="recipe-empty">No recipes found. Add your first recipe!</p>
        ) : (
          <div className="recipe-card-grid">
            {filteredRecipes.map((recipe) => (
              <article className="recipe-card" key={recipe.id}>
                {recipe.image_url ? (
                  <img
                    className="recipe-card-image"
                    src={recipe.image_url}
                    alt={recipe.food_name}
                  />
                ) : (
                  <div className="recipe-no-image">No image available</div>
                )}

                <div className="recipe-card-content">
                  <span className="recipe-category">
                    {recipe.category}
                  </span>

                  <h3>{recipe.food_name}</h3>

                  <p className="recipe-card-description">
                    {recipe.description || "A recipe from your collection."}
                  </p>

                  <div className="recipe-meta">
                    <span>
                      ◷ {Number(recipe.preparation_time) +
                        Number(recipe.cooking_time)} min
                    </span>
                    <span>🍽 {recipe.servings} servings</span>
                  </div>

                  <button
                    type="button"
                    className="recipe-view-button"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    View Recipe →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedRecipe && (
        <div
          className="recipe-modal-overlay"
          onClick={() => setSelectedRecipe(null)}
        >
          <section
            className="recipe-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedRecipe.food_name}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="recipe-modal-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Close recipe"
            >
              ×
            </button>

            {selectedRecipe.image_url && (
              <img
                className="recipe-modal-image"
                src={selectedRecipe.image_url}
                alt={selectedRecipe.food_name}
              />
            )}

            <div className="recipe-modal-content">
              <span className="recipe-category">
                {selectedRecipe.category}
              </span>

              <h2>{selectedRecipe.food_name}</h2>

              <p>{selectedRecipe.description}</p>

              <div className="recipe-detail-stats">
                <span>
                  Preparation: {selectedRecipe.preparation_time} min
                </span>
                <span>
                  Cooking: {selectedRecipe.cooking_time} min
                </span>
                <span>Serves: {selectedRecipe.servings}</span>
              </div>

              <h3>Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
              </ul>

              <h3>Cooking Instructions</h3>
              <div className="recipe-instructions">
                {selectedRecipe.cooking_instructions
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((step, index) => (
                    <p key={index}>{step}</p>
                  ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
