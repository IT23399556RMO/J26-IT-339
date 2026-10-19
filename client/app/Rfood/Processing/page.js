
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./Processing.css";

export default function Processing() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Analyzing your food...");
  const [foodImage, setFoodImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let interval;

    async function analyzeFood() {
      const imageData = sessionStorage.getItem("foodImage");

      // Redirect if no image is available
      if (!imageData) {
        router.replace("/Rfood/IdentifyFood");
        return;
      }

      setFoodImage(imageData);

      interval = setInterval(() => {
        setProgress((previous) =>
          previous >= 90 ? previous : previous + 1
        );
      }, 100);

      try {
        setMessage("Analyzing your food...");

        const imageResponse = await fetch(imageData);
        const blob = await imageResponse.blob();

        const formData = new FormData();
        formData.append("image", blob, "food.jpg");

        const apiResponse = await fetch("/api/identify-food", {
          method: "POST",
          body: formData,
        });

const responseText = await apiResponse.text();

let result;

try {
  result = JSON.parse(responseText);
} catch {
  console.error("Invalid API response:", responseText);
  throw new Error("API returned an invalid response. Check the server.");
}

console.log("API status:", apiResponse.status);
console.log("API response:", result);

// Check whether the API request was successfu
if (!apiResponse.ok) {
  throw new Error(
    result.error ||
    result.message ||
    `AI API failed with status ${apiResponse.status}`
  );
}

        if (cancelled) return;

        sessionStorage.setItem("foodResult", JSON.stringify(result));

        // Update the progress and display the success message
        setProgress(100);
        setMessage("Food identified successfully!");

        setTimeout(() => {
          if (!cancelled) router.push("/Rfood/Result");
        }, 800);
      } catch (error) {
        console.error("Food identification error:", error);

        if (cancelled) return;

        setMessage(error.message || "Something went wrong.");




        setTimeout(() => {
          if (!cancelled) router.replace("/Rfood/Result");
        }, 2500);
      } finally {
        clearInterval(interval);
      }
    }

    analyzeFood();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  return (
    <main className="processing-page">
      <header className="processing-header">
        <button
          className="back-button"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          ←
        </button>
        <h1>Processing</h1>
      </header>

      <div className="circle-container">
        <div
          className="progress-circle"
          style={{
            background: `conic-gradient(
              #159947 ${progress * 3.6}deg,
              #e8ece9 ${progress * 3.6}deg
            )`,
          }}
        >
          <div className="circle-inner">
            {foodImage && (
              <img src={foodImage} alt="Food being analyzed" />
            )}
          </div>
        </div>
      </div>

      <h2>{message}</h2>
      <p className="wait-text">Please wait a moment</p>

      <p className="progress-label">{progress}%</p>

      <div className="dots">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="fact-box">
        <div className="light-icon">💡</div>
        <div>
          <h3>DID YOU KNOW?</h3>
          <p>
            Sri Lankan cuisine is a wonderful blend of spices,
            fresh ingredients and timeless tradition.
          </p>
        </div>
      </div>
    </main>
  );
}
