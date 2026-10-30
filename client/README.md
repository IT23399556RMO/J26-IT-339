# 🍛 TravelMate – AI-Based Food Recognition and Dietary Guidance

**Research Project ID:** J26-IT339
**Component:** 4 – AI-Based Food Recognition and Dietary Guidance
**Researcher:** Ridmi Pavithra K.P.
**Module:** BSc (Hons) Information Technology Final Year Research Project (RP)
**Research Cluster:** Software Systems & Technologies (SST) @ SLIIT

An AI-powered feature of the TravelMate tourism platform that identifies Sri Lankan food from an uploaded photo and cross-references the dish's ingredients against the user's stored allergy profile to provide dietary safety guidance.

## 📌 Project Overview

Foreign tourists often struggle to identify local Sri Lankan dishes, which can pose serious allergy risks. This component lets a user snap or upload a photo of a dish. The vision model classifies the food, and the application retrieves the related recipe, ingredient, and allergy information from the database and compares it with the user's securely stored allergy profile.

The model is a TensorFlow/Keras image classifier built on the **EfficientNetB0** convolutional neural network and trained in Google Colab. The model files used are `lankafruit_model.keras` and `class_names.json`.

## ✨ Features

- Upload a food image for AI-based identification.
- Preview the selected image before analysis.
- Show a processing/loading state while the image is analysed.
- Display the predicted food and model confidence.
- Retrieve related food, recipe, and ingredient information from the database.
- Cross-reference ingredients against the user's allergy profile and show allergy warnings.
- Store and manage food allergy records (view, edit, delete), where implemented.
- Responsive, mobile-first interface (PWA) suitable for use in the field.

## 🛠️ Technologies Used

### Frontend
- Next.js 16 
- React 19
- Tailwind CSS v4
- JavaScript / TypeScript

### AI / Machine Learning
- Python 3.12+
- TensorFlow / Keras
- EfficientNetB0
- FastAPI and Uvicorn (AI inference service)
- Google Colab (model training)
- `lankafruit_model.keras`
- `class_names.json`

### Backend and Database
- Node.js, Express.js 5, TypeScript
- Prisma ORM
- PostgreSQL (with PostGIS used elsewhere in the TravelMate platform)
- JWT authentication
- pgAdmin 4 (optional, for database administration)

### Development Tools
- Visual Studio Code
- Node.js and npm
- Git and GitHub
- Google Colab
- Postman (optional, for API testing)

## 🏗️ System Architecture

```text
User
  |
  v
Next.js / React Frontend  (/food)
  |
  v
Node.js / Express API 
  |                     \
  v                      v
FastAPI AI Service      PostgreSQL Database
(EfficientNetB0)         |
  |                      v
  v                  Food / Recipe / Allergy Data
Predicted Food               |
  |                          v
  +-------> Ingredient vs. user allergy profile check
                             |
                             v
                   Result + Allergy Warnings
```

The AI model is trained in Google Colab and served through a FastAPI inference service. The model is loaded into memory so predictions can be returned to the Node.js server quickly.

## 📋 Prerequisites

- Node.js (v18+)
- npm
- Python (3.12+) and TensorFlow, to run the AI service locally
- PostgreSQL
- pgAdmin 4 (optional)
- A Google account and Google Colab, if retraining or using the hosted notebook
- Git

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/IT23399556RMO/J26-IT-339.git
cd J26-IT-339
```

### 2. Configure Environment Variables

Never commit these files to version control.

**Create `server/.env`:**
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=travelmate_db
DATABASE_URL=postgresql://postgres:your_database_password@localhost:5432/travelmate_db

```

**Create `client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api 
```

**Security:** Add `.env` and `.env.local` to `.gitignore`. Never commit database passwords, JWT secrets, API keys, or tunnel tokens. Do not expose database credentials through `NEXT_PUBLIC_` variables.

### 3. Configure PostgreSQL

1. Start PostgreSQL.
2. Create the project database (`travelmate_db`).
3. Run the migrations to create the tables, including food, recipe, and allergy tables.

```bash
cd server
npm install
npm run db:create
npm run migrate:up
```

### 4. Start the AI Prediction Service

Make sure `lankafruit_model.keras` and `class_names.json` are available to the service. If you serve the model from Google Colab instead, keep the runtime and tunnel running and update the AI service URL whenever it changes. Never commit tunnel tokens.

### 5. Start the Node.js Server

```bash
cd server
npm run dev
# Health check: http://localhost:5001/api/health
```

### 6. Start the Next.js Client

```bash
cd client
npm install
npm run dev
# http://localhost:3000
```

On Windows, you can instead double-click `run-project.bat` in the root directory to start all services.

## 💻 Usage

1. Start PostgreSQL.
2. Start the FastAPI AI service.
3. Start the Node.js server.
4. Start the Next.js client and open `http://localhost:3000`.
5. Log in and set up your allergy profile.
6. Open the **Food Scanner** page (`/food`).
7. Upload a clear image of a Sri Lankan food item.
8. Start the analysis and wait for the prediction.
9. Review the predicted food and confidence score.
10. Check the retrieved ingredients and the allergy warnings cross-referenced with your profile.

**Important:** An image-classification prediction does not by itself verify every ingredient in a dish or determine whether it is safe for someone with an allergy. Users should always confirm ingredients with the restaurant or a reliable source.

## 📁 Project Structure

Illustrative only. Adjust it to match your actual repository.

## Project Structure

```text
J26-IT-339-com4-feature-food/
├── client/                         # Next.js frontend application
│   ├── app/
│   │   ├── Rfood/                  # Food identification and allergy flows
│   │   │   ├── FoodAllergy/
│   │   │   ├── FoodAllergyList/
│   │   │   ├── Processing/
│   │   │   ├── Recipes/
│   │   │   ├── Result/
│   │   │   ├── Rwellcomepage/
│   │   │   └── foodUploadpage/
│   │   ├── admin/                  # Admin dashboard and user management
│   │   ├── api/                    # Next.js API routes
│   │   │   ├── check-food-allergy/
│   │   │   ├── food-allergies/
│   │   │   ├── identify-food/
│   │   │   └── recipes/
│   │   ├── components/             # Shared UI components
│   │   ├── context/                # React context providers
│   │   ├── home/                   # Home page
│   │   ├── settings/               # Profile and settings pages
│   │   ├── sign/                   # Login and registration pages
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/                        # Database and utility helpers
│   ├── public/                     # Static assets
│   ├── package.json
│   └── next.config.ts
├── server/                         # Backend application
│   ├── src/
│   │   ├── controllers/            # Request controllers
│   │   ├── middleware/             # Authentication middleware
│   │   ├── migrations/             # Database migrations
│   │   ├── routes/                 # API route definitions
│   │   ├── services/               # Database and service logic
│   │   ├── types/                  # Shared server types
│   │   └── server.ts               # Server entry point
│   ├── scripts/                    # Database and maintenance scripts
│   └── package.json
└── package-lock.json

```

## 🔐 Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `PORT` | server | Express server port |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | server | PostgreSQL connection settings |
| `DATABASE_URL` | server | Prisma / PostgreSQL connection string |
| `JWT_SECRET` | server | Signing key for authentication tokens |
| `NEXT_PUBLIC_API_URL` | client | Base URL of the Node.js API |
| `NEXT_PUBLIC_FASTAPI_URL` | client | Base URL of the FastAPI AI service |

Use placeholder values in documentation and keep real secrets in local environment files or a secure secret manager.

## 🧪 Testing and Troubleshooting

### Suggested tests

- Upload a valid food image and confirm that a prediction is returned.
- Upload an unsupported file type and confirm that a helpful error is displayed.
- Stop the AI service and confirm that the frontend shows a clear connection error.
- Verify that API routes return the expected JSON response.
- Test database insert, read, update, and delete operations for allergy records.
- Test that a dish containing a user's allergen triggers a warning.
- Test behaviour when a food or allergy record does not exist.
- Confirm that database credentials and tokens are not exposed in browser responses.

### Common issues

**AI prediction fails**
- Check that the FastAPI service (or Colab runtime) is running.
- Confirm that the model and class-name files load successfully.
- Check the AI service URL and tunnel status.
- Check that the request format matches the prediction endpoint.

**PostgreSQL connection fails**
- Confirm that PostgreSQL is running.
- Verify the database name, host, port, username, and password.
- Check that the server reads the correct environment variables.
- Review the terminal logs for the underlying database error.

**API returns HTML instead of JSON**
- Check that the requested API route exists.
- Review the server logs for compilation or runtime errors.
- Confirm that the frontend is calling the correct URL.

## 👥 Contributors

- Component lead: Ridmi Pavithra K.P.
- Project repository: [IT23399556RMO/J26-IT-339](https://github.com/IT23399556RMO/J26-IT-339)
- Project Branch: https://github.com/IT23399556RMO/J26-IT-339/tree/com4-feature-food

This component is part of the TravelMate research project (J26-IT339) at SLIIT.
