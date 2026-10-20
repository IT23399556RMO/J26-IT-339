
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAllergen(allergyName, ingredient) {
  const allergy = normalize(allergyName);
  const ingredientName = normalize(ingredient.ingredient_name);
  const category = normalize(ingredient.allergen_category);

  if (!allergy) return false;

  // Exact matching avoids many accidental partial matches.
  return (
    allergy === ingredientName ||
    allergy === category
  );
}

export async function POST(request) {
  try {
    const { foodName } = await request.json();

    if (!foodName || typeof foodName !== "string") {
      return NextResponse.json(
        { message: "Food name is required." },
        { status: 400 }
      );
    }

    const normalizedFood = normalize(foodName);

    const ingredientResult = await pool.query(
      `SELECT ingredient_id, food_name, ingredient_name,
              allergen_category, is_common_allergen
       FROM public.food_ingredients
       WHERE LOWER(REPLACE(TRIM(food_name), '_', ' ')) = $1
       ORDER BY ingredient_name`,
      [normalizedFood]
    );

    const ingredients = ingredientResult.rows;

    // Only active allergy records are checked.
    const allergyResult = await pool.query(
      `SELECT id, food_name, category, severity
       FROM public.food_allergies
       WHERE LOWER(TRIM(status)) = 'active'`
    );

    const allergies = allergyResult.rows;

    const matches = [];

    for (const allergy of allergies) {
      for (const ingredient of ingredients) {
        if (matchesAllergen(allergy.food_name, ingredient)) {
          matches.push({
            allergyName: allergy.food_name,
            severity: allergy.severity,
            ingredient: ingredient.ingredient_name,
            allergenCategory: ingredient.allergen_category,
          });
        }
      }
    }

    const uniqueMatches = [
      ...new Map(
        matches.map((item) => [
          `${normalize(item.allergyName)}|${normalize(item.ingredient)}`,
          item,
        ])
      ).values(),
    ];

    return NextResponse.json({
      foodName,
      ingredientsFound: ingredients.length > 0,
      ingredients: ingredients.map((item) => item.ingredient_name),
      checkedAllergyCount: allergies.length,
      status: ingredients.length === 0
        ? "unknown"
        : uniqueMatches.length > 0
          ? "potential_match"
          : "no_match_found",
      matches: uniqueMatches,
      message:
        ingredients.length === 0
          ? "Ingredients have not been verified in the database."
          : uniqueMatches.length > 0
            ? "Potential allergen matches were found."
            : "No matching allergens were found in the available data.",
    });
  } catch (error) {
    console.error("Food allergy check error:", error);

    return NextResponse.json(
      { message: "Unable to check food allergies." },
      { status: 500 }
    );
  }
}
