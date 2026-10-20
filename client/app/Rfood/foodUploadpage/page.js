
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./IdentifyFood.css";

export default function IdentifyFood() {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setSelectedImage(imageUrl);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleIdentifyFood = () => {
    if (!selectedFile || !selectedImage) {
      alert("Please select a food image first.");
      return;
    }

    // Store the image for the Processing page.
    // Convert the local object URL to Base64 first.
    const reader = new FileReader();

    reader.onload = () => {
      sessionStorage.setItem("foodImage", reader.result);
      sessionStorage.removeItem("foodResult");

      router.push("/Rfood/Processing");
    };

    reader.onerror = () => {
      alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <main className="identify-page">
      <header className="identify-header">
        <button
          type="button"
          className="back-button"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          ←
        </button>
        <h1>Identify Food</h1>
      </header>

      <section
        className={`upload-box ${dragActive ? "drag-active" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected food"
            className="selected-image"
          />
        ) : (
          <>
            <div className="upload-icon">↑</div>
            <h2>Upload Food Image</h2>
            <p>
              Drag &amp; drop an image here
              <br />
              or click to browse
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          hidden
        />
      </section>

      <div className="or-section">
        <span />
        <strong>OR</strong>
        <span />
      </div>

      <button
        type="button"
        className="option-card"
        onClick={() => cameraInputRef.current?.click()}
      >
        <div className="option-icon">📷</div>
        <div className="option-content">
          <h3>Take Photo</h3>
          <p>
            Open camera and
            <br />
            take a photo
          </p>
        </div>
        <div className="arrow">›</div>
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        hidden
      />

      <button
        type="button"
        className="option-card"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="option-icon">🖼️</div>
        <div className="option-content">
          <h3>Choose from Gallery</h3>
          <p>
            Select an image from
            <br />
            your gallery
          </p>
        </div>
        <div className="arrow">›</div>
      </button>

      <div className="supported">
        <span>🌿</span>
        <p>Supported formats: JPG, JPEG, PNG, WEBP</p>
        <span>🥥</span>
      </div>

      {selectedImage && (
        <button
          type="button"
          className="identify-button"
          onClick={handleIdentifyFood}
        >
          Identify Food →
        </button>
      )}
    </main>
  );
}
