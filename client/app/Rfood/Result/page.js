
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./Result.css";

export default function Result() {
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [recipeError, setRecipeError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      const savedResult = sessionStorage.getItem("foodResult");

      if (!savedResult) {
        router.replace("/Rfood/foodUploadpage");
        return;
      }

      let parsedResult;

      try {
        parsedResult = JSON.parse(savedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error("Invalid food result:", error);
        router.replace("/Rfood/foodUploadpage");
        return;
      }

      const foodName = String(
        parsedResult.food_name || ""
      )
        .replaceAll("_", " ")
        .trim();

      if (!foodName) {
        setRecipeLoading(false);
        setRecipeError("Food name is unavailable.");
        return;
      }

      try {
        const response = await fetch(
          `/api/recipes?foodName=${encodeURIComponent(foodName)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load food details."
          );
        }

        if (!cancelled) {
          setRecipe(data.recipe || null);
        }
      } catch (error) {
        console.error("Recipe loading error:", error);

        if (!cancelled) {
          setRecipeError(
            error.message || "Unable to load food details."
          );
        }
      } finally {
        if (!cancelled) {
          setRecipeLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!result) {
    return (
      <main className="result-page">
        <p className="result-loading">Loading result...</p>
      </main>
    );
  }

  const confidence = Number(result.confidence);

  const predictions = Array.isArray(result.top_predictions)
    ? result.top_predictions
    : [];

  const displayName = (name) =>
    String(name || "Unknown").replaceAll("_", " ");

  const formatValue = (value) => {
    if (value == null || value === "") return "";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <main className="result-page">
      <header className="result-header">
        <button
          className="result-back-button"
          onClick={() => router.push("/Rfood/foodUploadpage")}
          aria-label="Go back"
        >
          ←
        </button>

        <h1>Food Identification Result</h1>
      </header>

      {/* AI Prediction */}
      <section className="result-hero">
        <div className="result-success-icon">✓</div>

        <p className="result-eyebrow">
          AI IDENTIFICATION COMPLETE
        </p>

        <h2>{displayName(result.food_name)}</h2>

        <p className="result-description">
          Our AI model has analyzed your food image.
        </p>

        <div className="confidence-card">
          <div className="confidence-heading">
            <span>AI Confidence</span>

            <strong>
              {Number.isFinite(confidence)
                ? `${(confidence * 100).toFixed(2)}%`
                : "Unavailable"}
            </strong>
          </div>

          <div className="confidence-track">
            <div
              className="confidence-fill"
              style={{
                width: `${
                  Number.isFinite(confidence)
                    ? Math.max(
                        0,
                        Math.min(100, confidence * 100)
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Database Food Details */}
      <section className="predictions-section">
        <h2>Food Information</h2>

        <p className="section-description">
          Additional details from our food database.
        </p>

        {recipeLoading ? (
          <p className="result-loading">
            Loading food information...
          </p>
        ) : recipe ? (
          <div className="recipe-details">
            {recipe.image_url && (
              <img
                className="recipe-image"
                src={recipe.image_url}
                alt={displayName(recipe.food_name)}
              />
            )}

            <h3>{displayName(recipe.food_name)}</h3>

            {recipe.category && (
              <div className="recipe-detail-card">
                <h4>Category</h4>
                <p>{formatValue(recipe.category)}</p>
              </div>
            )}

            {recipe.description && (
              <div className="recipe-detail-card">
                <h4>Description</h4>
                <p>{formatValue(recipe.description)}</p>
              </div>
            )}

            {recipe.ingredients && (
              <div className="recipe-detail-card">
                <h4>🥥 Ingredients</h4>
                <p>{formatValue(recipe.ingredients)}</p>
              </div>
            )}

            {recipe.spice_level && (
              <div className="recipe-detail-card">
                <h4>🌶️ Spice Level</h4>
                <p>{formatValue(recipe.spice_level)}</p>
              </div>
            )}

            {recipe.allergens && (
              <div className="recipe-detail-card allergy-detail">
                <h4>⚠️ Possible Allergens</h4>
                <p>{formatValue(recipe.allergens)}</p>
              </div>
            )}

            {recipe.nutrition_info && (
              <div className="recipe-detail-card">
                <h4>🥗 Nutrition Information</h4>
                <p>{formatValue(recipe.nutrition_info)}</p>
              </div>
            )}

            {recipe.cooking_instructions && (
              <div className="recipe-detail-card">
                <h4>👨‍🍳 Cooking Instructions</h4>
                <p>
                  {formatValue(recipe.cooking_instructions)}
                </p>
              </div>
            )}

            {(recipe.preparation_time != null ||
              recipe.cooking_time != null ||
              recipe.servings != null) && (
              <div className="recipe-detail-card">
                <h4>Preparation Details</h4>

                {recipe.preparation_time != null && (
                  <p>
                    Preparation time:{" "}
                    {recipe.preparation_time} minutes
                  </p>
                )}

                {recipe.cooking_time != null && (
                  <p>
                    Cooking time: {recipe.cooking_time} minutes
                  </p>
                )}

                {recipe.servings != null && (
                  <p>Servings: {recipe.servings}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="recipe-detail-card">
            <h3>
              {recipeError
                ? "Food details unavailable"
                : "Recipe not found"}
            </h3>

            <p>
              {recipeError ||
                `No recipe details were found for ${displayName(
                  result.food_name
                )}. Add the matching food to the food_recipes table.`}
            </p>
          </div>
        )}
      </section>

      {/* Other AI Predictions */}
      <section className="predictions-section">
        <h2>Other Predictions</h2>

        <p className="section-description">
          The top food classes predicted by the AI model.
        </p>

        {predictions.length > 0 ? (
          <div className="predictions-list">
            {predictions.map((item, index) => {
              const score = Number(item.confidence);

              const percentage = Number.isFinite(score)
                ? Math.max(0, Math.min(100, score * 100))
                : 0;

              return (
                <article
                  className="prediction-card"
                  key={`${item.food_name}-${index}`}
                >
                  <div className="prediction-top">
                    <div className="prediction-name">
                      <span className="prediction-number">
                        {index + 1}
                      </span>

                      <h3>{displayName(item.food_name)}</h3>
                    </div>

                    <strong>
                      {percentage.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="prediction-track">
                    <div
                      className="prediction-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="no-predictions">
            No additional predictions are available.
          </p>
        )}
      </section>

      {/* Allergy Notice */}
      <div className="result-notice">
        <span>ⓘ</span>

        <p>
          AI predictions may be incorrect. Database allergen
          information may be incomplete. Always verify the actual
          ingredients and preparation method before eating.
        </p>
      </div>

      <button
        className="identify-again-button"
        onClick={() => router.push("/Rfood/foodUploadpage")}
      >
        Identify Another Food →
      </button>
    </main>
  );
}
