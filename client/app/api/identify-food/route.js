
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "Please upload a food image." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Uploaded file must be an image." },
        { status: 400 }
      );
    }

    const apiUrl = process.env.COLAB_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { error: "COLAB_API_URL is missing in .env.local." },
        { status: 500 }
      );
    }

    const aiFormData = new FormData();

    // Flask API expects the field name "image"
    aiFormData.append("image", image, image.name || "food.jpg");

    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/predict`,
      {
        method: "POST",
        body: aiFormData,
        cache: "no-store",
        signal: AbortSignal.timeout(120000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || "AI prediction failed." },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Identify food API error:", error);

    return NextResponse.json(
      {
        error:
          error.name === "TimeoutError"
            ? "AI prediction timed out. Please try again."
            : "Unable to connect to the AI service. Check whether Colab is running.",
      },
      { status: 502 }
    );
  }
}
