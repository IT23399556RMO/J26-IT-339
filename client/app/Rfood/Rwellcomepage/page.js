
import React from "react";
import Link from "next/link";
import "./SplashScreen.css";

export default function SplashScreen() {
  return (
    <main className="splash">

      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="hero">

        <h1 className="title">
          LankaFruit <span>AI</span>
        </h1>

        <p className="subtitle">
          Sri Lankan Food
          <br />
          Identification System
        </p>

        <p className="description">
          Discover and identify Sri Lankan food
          <br />
          using the power of Artificial Intelligence.
        </p>

      </section>


      {/* ================================
          BUTTON SECTION
      ================================= */}

      <div className="main-buttons">

        {/* AI IMAGE BUTTON */}

        <Link href="/Rfood/foodUploadpage">
          <button className="ai-image-button">
            Allergy Checker →
          </button>
        </Link>


        {/* TWO BOTTOM BUTTONS */}

        <div className="bottom-buttons">

          {/* FOOD ALLERGY */}

          <Link href="/Rfood/FoodAllergy">
            <button className="small-button">
              Add Allergy
            </button>
          </Link>


          {/* ABOUT */}

          <Link href="/Rfood/FoodAllergyList">
            <button className="small-button">
              View Allergy
            </button>
          </Link>

        </div>

      </div>


      {/* ================================
          BOTTOM TEXT
      ================================= */}

      <p className="tagline">
        AI Powered • Smart • Simple
      </p>

    </main>
  );
}