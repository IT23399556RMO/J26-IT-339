
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const allergyId = Number(id);

    if (!Number.isInteger(allergyId) || allergyId <= 0) {
      return NextResponse.json(
        { message: "Invalid allergy ID." },
        { status: 400 }
      );
    }

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

    const result = await pool.query(
      `UPDATE food_allergies
       SET food_name = $1,
           category = $2,
           severity = $3,
           symptoms = $4,
           reaction_time = $5,
           reaction_description = $6,
           date_identified = $7,
           status = $8,
           additional_notes = $9
       WHERE id = $10
       RETURNING *`,
      [
        foodName.trim(),
        category,
        severity,
        symptoms,
        reactionTime || null,
        reactionDescription || null,
        dateIdentified || null,
        status,
        additionalNotes || null,
        allergyId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Food allergy not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Food allergy updated successfully.",
      allergy: result.rows[0],
    });
  } catch (error) {
    console.error("Update food allergy error:", error);

    return NextResponse.json(
      { message: "Unable to update food allergy." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const allergyId = Number(id);

    if (!Number.isInteger(allergyId) || allergyId <= 0) {
      return NextResponse.json(
        { message: "Invalid allergy ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM food_allergies
       WHERE id = $1
       RETURNING id`,
      [allergyId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Food allergy not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Food allergy deleted successfully.",
    });
  } catch (error) {
    console.error("Delete food allergy error:", error);

    return NextResponse.json(
      { message: "Unable to delete food allergy." },
      { status: 500 }
    );
  }
}
//