import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      foodName,
      category,
      severity,
      symptoms = [],
      reactionTime,
      reactionDescription,
      dateIdentified,
      status = "Active",
      additionalNotes,
    } = data;

    if (
      !foodName?.trim() ||
      !category ||
      !severity ||
      !Array.isArray(symptoms)
    ) {
      return NextResponse.json(
        { message: "Invalid or missing required fields." },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO food_allergies (
        food_name,
        category,
        severity,
        symptoms,
        reaction_time,
        reaction_description,
        date_identified,
        status,
        additional_notes
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9
      )
      RETURNING id, food_name, created_at;
    `;

    const values = [
      foodName.trim(),
      category,
      severity,
      symptoms,
      reactionTime || null,
      reactionDescription || null,
      dateIdentified || null,
      status,
      additionalNotes || null,
    ];

    const result = await pool.query(sql, values);

    return NextResponse.json(
      {
        message: "Food allergy saved successfully.",
        allergy: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Food allergy save error:", error);

    return NextResponse.json(
      { message: "Unable to save food allergy." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        food_name,
        category,
        severity,
        symptoms,
        reaction_time,
        reaction_description,
        date_identified,
        status,
        additional_notes,
        created_at
      FROM food_allergies
      ORDER BY created_at DESC NULLS LAST, id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Fetch food allergies error:", error);

    return NextResponse.json(
      { message: "Unable to fetch food allergies." },
      { status: 500 }
    );
  }
}
