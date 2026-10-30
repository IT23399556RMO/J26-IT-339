# IT23286832 - DE Silva J.G.M.N
# TravelMate — Smart Crowd Forecasting & Prediction System 

# Research Project ID:** J26-IT339

# Component:** 2 – Smart Crowd Forecasting & Prediction System
# Researcher:** - DE Silva J.G.M.N
# Module:** BSc (Hons) Information Technology Final Year Research Project (RP)
# Research Cluster:** Software Systems & Technologies (SST) @ SLIIT
An intelligent crowd forecasting and destination occupancy prediction platform designed to help travelers, commuters, and venue managers anticipate crowd levels, avoid congestion, and plan optimal visit times.

---

## 📌 Project Overview

Overcrowding at tourist attractions, transit hubs, dining venues, and public spaces leads to long wait times, safety concerns, and poor visitor experiences. **TravelMate (Component 2 — Crowd Prediction)** solves this problem by analyzing historical visitor trends, time-of-day patterns, seasonal events, and real-time occupancy data to forecast crowd density accurately.

### Target Users
- **Travelers & Tourists:** Plan itineraries around low-crowd time slots and discover less congested alternatives.
- **Daily Commuters & Visitors:** Check real-time and predicted occupancy levels before visiting public venues or dining areas.
- **Venue & Tourism Administrators:** Monitor crowd thresholds, manage capacity records, and configure alerts for peak congestion hours.

### Core Capabilities
- Interactive crowd forecasting dashboards with hourly, daily, and weekly density predictions.
- Color-coded severity and occupancy indicators (**Low**, **Moderate**, **High / Severe**).
- Full CRUD management for crowd reports, venue capacity records, and user profiles.
- Role-based access control (**User** and **Admin** roles) with JWT authentication.

---

## ✨ Features

- **User Registration & Authentication:** Secure sign-up, login, profile updates, and account management with JWT and password hashing (`bcryptjs`).
- **Role-Based Access Control (RBAC):** Dedicated permissions for standard travelers (`user`) and platform managers (`admin`).
- **Crowd Forecasting & Analytics:** Predict and visualize crowd density levels across locations, dates, and peak hours.
- **Create, View, Update, and Delete (CRUD) Records:** Manage crowd observation logs, location capacity records, and traveler preferences/profiles.
- **Real-Time Search & Filtering:** Filter locations and records by crowd severity, time window, or destination name.
- **User-Friendly & Responsive Interface:** Clean, mobile-ready dashboard built with Next.js, React, and Tailwind CSS.

---

## 🛠️ Technologies Used

### Frontend (`client/`)
- **Next.js 16 & React 19** (TypeScript)
- **Tailwind CSS v4** & Custom Responsive CSS
- **FontAwesome Icons** (`@fortawesome/react-fontawesome`)
- **React Data Table Component** (`react-data-table-component`)

### Backend (`server/`)
- **Node.js & Express.js 5** (TypeScript)
- **JSON Web Tokens (`jsonwebtoken`)** for stateless authentication
- **`bcryptjs`** for secure password hashing

### Database
- **PostgreSQL** (`pg` connection pool, `node-pg-migrate`, Prisma ORM support)

### Tools
- **Git & GitHub** — Version control and collaboration
- **Visual Studio Code** — IDE and code development
- **Postman** — REST API testing and endpoint validation

---

## 🏗️ System Architecture

The application follows a decoupled 3-tier Client–Server–Database architecture:

```text
Next.js / React Frontend (Port 3000)
        │
        ▼  HTTP / REST API (JSON + Bearer JWT)
Express.js / TypeScript Backend (Port 5001)
        │
        ▼  SQL Queries / Connection Pool (pg)
PostgreSQL Relational Database (Port 5432)
```

1. **Frontend Layer (`client`):** Captures user input, renders crowd forecast charts/tables, manages authentication state via `AuthContext`, and communicates with the backend over RESTful HTTP requests.
2. **Backend API Layer (`server`):** Validates requests, enforces JWT & Admin middleware (`verifyToken`, `isAdmin`), processes crowd prediction and user business logic, and executes parameterized SQL queries.
3. **Database Layer (`PostgreSQL`):** Persists user accounts, roles, location records, and historical/forecasted crowd metrics.

---

## 📋 Prerequisites

Make sure you have the following installed on your machine before setting up the project:

- **Node.js** (v18.x or v20+ recommended)
- **npm** (included with Node.js)
- **PostgreSQL** (v14+ running locally or remotely)
- **Git**

---

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/IT23399556RMO/J26-IT-339
```

### 2. Navigate to the Project Directory

```bash
cd J26-IT-339
```

### 3. Set Up the Backend (`server`)

Navigate to the backend directory, install dependencies, and start the development server:

```bash
cd server
npm install
```

Configure your `.env` file in `server/` (see [Environment Variables](#-environment-variables)), create the database, run migrations, and start the server:

```bash
npm run db:create
npm run migrate:up
npm run dev
```

The backend API will start at `http://localhost:5001`.

### 4. Set Up the Frontend (`client`)

Open a new terminal, navigate to the frontend directory, install dependencies, and launch the Next.js development server:

```bash
cd client
npm install
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

### 5. Configure the Database

Ensure your **PostgreSQL** service is running and that the connection credentials in `server/.env` match your local PostgreSQL setup. You can verify database connectivity at any time by visiting `http://localhost:5001/api/health`.

---

## 💻 Usage

1. **Start the PostgreSQL service** on your machine.
2. **Start the backend server** (`cd server && npm run dev`).
3. **Start the frontend development server** (`cd client && npm run dev`).
4. **Open your browser** and navigate to `http://localhost:3000`.
5. **Register a new account or log in** using your credentials.
6. **Explore Crowd Forecasts & Features:**
   - View predicted crowd levels and severity badges (**Low**, **Moderate**, **High/Severe**) for destinations.
   - Add, edit, filter, or delete records using the interactive forms and data tables.
   - Manage your user profile or (as an Admin) oversee registered users and platform data.

---

## 📁 Project Structure

```text
J26-IT-339-com2-crowd-prediction/
├── client/                          # Next.js (React + TypeScript) Frontend
│   ├── app/
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Client authentication & JWT state management
│   │   ├── Rfood/                   # Feature modules, forms & data list views
│   │   ├── globals.css              # Global Tailwind & custom styles
│   │   ├── layout.tsx               # Root application layout
│   │   └── page.tsx                 # Landing / Home page
│   ├── public/                      # Static assets
│   └── package.json
├── server/                          # Express.js (TypeScript) Backend API
│   ├── scripts/
│   │   └── create-db.js             # Automated PostgreSQL database creation script
│   ├── src/
│   │   ├── controllers/
│   │   │   └── userController.ts    # Auth, profile & admin CRUD controllers
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts    # JWT verification & role-based guards
│   │   ├── routes/
│   │   │   └── userRoutes.ts        # API endpoint definitions
│   │   ├── services/
│   │   │   └── db.ts                # PostgreSQL connection pool & health check
│   │   ├── types/                   # TypeScript interfaces & API response envelopes
│   │   └── server.ts                # Express app entry point
│   └── package.json
├── .gitignore
└── README.md
```



## 🔐 Environment Variables

Create a `.env` file inside the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5001
CLIENT_URL=http://localhost:3000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_database_password
DB_NAME=travelmate_crowd_db
DATABASE_URL=postgresql://postgres:your_database_password@localhost:5432/travelmate_crowd_db


Optionally, create a `.env.local` file inside the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

> **Important:** Never commit `.env` files, passwords, API keys, database credentials, or secret tokens to GitHub. `.env*` files are ignored by default in `.gitignore`.

---

## 🧪 Testing

### 1. Health Check Endpoint
Verify that both the Express server and PostgreSQL database are running properly:
- **GET** `http://localhost:5001/api/health`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Server and database are running"
  }
  ```

### 2. API Testing with Postman
Import or test the following endpoints in **Postman**:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Check server and database connectivity |
| `POST` | `/api/users/register` | Public | Register a new user account |
| `POST` | `/api/users/login` | Public | Authenticate user and receive a Bearer JWT |
| `PUT` | `/api/users/profile` | Protected (`Bearer <token>`) | Update authenticated user's profile/password |
| `DELETE` | `/api/users/profile` | Protected (`Bearer <token>`) | Delete authenticated user's account |
| `GET` | `/api/users/all` | Admin Only (`Bearer <token>`) | Retrieve all registered users |

---

## 👥 Contributors

- Component lead: DE Silva J.G.M.N
- **my Contributor ** — [IT23399556RMO/J26-IT-339](https://github.com/IT23399556RMO/J26-IT-339/tree/com2-crowd-prediction)
- Project repository: [IT23399556RMO/J26-IT-339](https://github.com/IT23399556RMO/J26-IT-339)


This component is part of the TravelMate research project (J26-IT339) at SLIIT.

