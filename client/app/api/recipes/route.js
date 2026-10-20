import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

// GET all recipes OR get one recipe by food name
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const foodName = searchParams.get("foodName");

    if (foodName?.trim()) {
      const result = await pool.query(
        `SELECT *
         FROM public.food_recipes
         WHERE LOWER(REPLACE(TRIM(food_name), '_', ' ')) =
               LOWER(REPLACE(TRIM($1), '_', ' '))
         ORDER BY id DESC
         LIMIT 1`,
        [foodName.trim()]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Food recipe not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        recipe: result.rows[0],
      });
    }

    const result = await pool.query(`
      SELECT *
      FROM public.food_recipes
      ORDER BY created_at DESC NULLS LAST, id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Fetch recipes error:", error.message);

    return NextResponse.json(
      { message: "Unable to load recipes." },
      { status: 500 }
    );
  }
}

// POST a new recipe
export async function POST(request) {
  let savedImagePath = null;

  try {
    const formData = await request.formData();

    const foodName = String(
      formData.get("foodName") || ""
    ).trim();

    const category = String(
      formData.get("category") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const ingredients = String(
      formData.get("ingredients") || ""
    ).trim();

    const cookingInstructions = String(
      formData.get("cookingInstructions") || ""
    ).trim();

    const spiceLevel = String(
      formData.get("spiceLevel") || ""
    ).trim();

    const allergens = String(
      formData.get("allergens") || ""
    ).trim();

    const nutritionInfo = String(
      formData.get("nutritionInfo") || ""
    ).trim();

    const preparationTime = Number(
      formData.get("preparationTime")
    );

    const cookingTime = Number(
      formData.get("cookingTime")
    );

    const servings = Number(
      formData.get("servings")
    );

    const image = formData.get("image");

    if (
      !foodName ||
      !category ||
      !ingredients ||
      !cookingInstructions
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(preparationTime) ||
      preparationTime < 0 ||
      !Number.isInteger(cookingTime) ||
      cookingTime < 0 ||
      !Number.isInteger(servings) ||
      servings < 1
    ) {
      return NextResponse.json(
        { message: "Enter valid time and serving values." },
        { status: 400 }
      );
    }

    let imageUrl = null;

    if (
      image &&
      typeof image === "object" &&
      typeof image.size === "number" &&
      image.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { message: "Upload a JPG, PNG or WebP image." },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Image size must be under 5 MB." },
          { status: 400 }
        );
      }

      const extensionByType = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "recipes"
      );

      await mkdir(uploadDir, { recursive: true });

      const filename =
        randomUUID() + extensionByType[image.type];

      savedImagePath = path.join(uploadDir, filename);

      await writeFile(
        savedImagePath,
        Buffer.from(await image.arrayBuffer())
      );

      imageUrl = `/uploads/recipes/${filename}`;
    }

    const result = await pool.query(
      `INSERT INTO public.food_recipes (
        food_name,
        category,
        description,
        ingredients,
        cooking_instructions,
        preparation_time,
        cooking_time,
        servings,
        image_url,
        spice_level,
        allergens,
        nutrition_info
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *`,
      [
        foodName,
        category,
        description || null,
        ingredients,
        cookingInstructions,
        preparationTime,
        cookingTime,
        servings,
        imageUrl,
        spiceLevel || null,
        allergens || null,
        nutritionInfo || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Recipe saved successfully.",
        recipe: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (savedImagePath) {
      await unlink(savedImagePath).catch(() => {});
    }

    console.error("Save recipe error:", error.message);

    return NextResponse.json(
      { message: "Unable to save recipe." },
      { status: 500 }
    );
  }
}
