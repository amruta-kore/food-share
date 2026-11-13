# AnnaSetu (अन्नसेतु) – Complete Project Architecture, Logic & Setup Guide

> **AnnaSetu** is a full-stack surplus food redistribution and hunger-relief web platform connecting **Food Donors** (restaurants, banquet halls, caterers, households), **Verified NGOs / Shelters**, and **Volunteer Couriers**, overseen by an **Admin Management System**.

---

## 1. System Overview & Technology Stack

### 1.1 Architecture
The project follows a modern decoupled architecture:
* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide/SVG Icons, bilingual i18n support (English & Marathi).
* **Backend**: Node.js, Express, TypeScript, Prisma ORM 6, Multer (KYC document and food image processing with base64 cloud-persistence), Nodemailer (automated transactional emails).
* **Database**: MySQL (compatible with local MySQL, Aiven Cloud, AWS RDS, Railway, PlanetScale).
* **Security & Auth**: Role-Based Access Control (RBAC), JWT (Access + Refresh tokens), bcrypt password hashing, and two-party OTP chain-of-custody verification.

---

## 2. Core Modules & Business Logic

### 2.1 User Roles & Authentication (`/api/auth`)
* **Roles**:
  * `DONOR`: Individuals, restaurants, caterers donating surplus food.
  * `NGO`: Registered charities, orphanages, and community shelters claiming meals.
  * `VOLUNTEER`: Citizens / delivery agents transporting food from donor to NGO.
  * `ADMIN`: Platform administrator approving accounts and reviewing system metrics.
* **KYC Document Verification**:
  * On registration, Donors, NGOs, and Volunteers submit verification documents (e.g., FSSAI license, 80G/NGO certificate, Govt ID).
  * Accounts are locked (`verified = false`) until reviewed and approved by Admin via `requireVerified` middleware.
* **Default Seed Admin**:
  * **Email**: `admin@annasetu.org` (or `admin@foodshare.org`)
  * **Password**: `Admin@123`

---

### 2.2 Food Redistribution Lifecycle & OTP Handover Protocol

```
[Donor Creates Listing] (Status: AVAILABLE)
        │
        ▼
[NGO Submits Claim Request] (Status: REQUESTED)
        │
        ▼
[Donor Reviews & Accepts Claim] (Status: ACCEPTED)
        │
        ▼
[Volunteer Claims Mission] (Status: VOLUNTEER_ASSIGNED)
  ├── Generates 4-digit Pickup OTP (held by Volunteer)
  └── Generates 4-digit Drop-off OTP (held by NGO)
        │
        ▼
[Pickup Handover: Donor enters/verifies Volunteer's Pickup OTP] 
  └── (Status: PICKED_UP -> OUT_FOR_DELIVERY)
        │
        ▼
[Drop-off Handover: Volunteer enters NGO's Drop-off OTP]
  └── (Status: DELIVERED)
        │
        ▼
[NGO Confirms Final Receipt] (Status: COMPLETED)
  └── Food impact counters (kg saved, servings rescued) updated!
```

---

### 2.3 Additional Platform Features
* **Live Food Expiry Timers**: Dynamic countdown based on `consumeBefore` timestamp.
* **Environmental & Social Impact Engine (`/food-impact`)**: Calculates CO₂ emissions diverted, liters of water saved, and meals provided.
* **Community Feedback System (`/feedback`)**: 5-star ratings and categorization open to both registered users and visitors.
* **Bilingual Localization**: Instant English ⇄ Marathi toggle across all views.

---

## 3. Prerequisites

Before running the application, ensure the following are installed:
1. **Node.js**: v18.x or v20.x or higher (`node -v`)
2. **npm**: v9.x or higher (`npm -v`)
3. **MySQL**: A running MySQL database instance (Local MySQL or Cloud provider like Aiven).

---

## 4. Environment Variables Configuration

### 4.1 Backend (`backend/.env`)
Create or edit `backend/.env` with the following variables:

```env
# Database connection string (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/annasetu"

# Secret keys for signing JWT tokens
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-jwt-secret-min-32-chars"

# Email Configuration (Nodemailer Gmail App Password or SMTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Server Port (Default: 4000)
PORT=4000
```

> **Note:** If an Aiven Cloud database is already configured in `backend/.env`, you can use it directly without setting up local MySQL.

---

### 4.2 Frontend (`frontend/.env.local`)
Create `frontend/.env.local` if custom backend URL is required (optional in local dev, Next.js rewrites to `http://127.0.0.1:4000` automatically):

```env
# For local development (leave empty or point to localhost:4000):
NEXT_PUBLIC_API_URL=""

# For production deployment (e.g. Render/Railway backend):
# NEXT_PUBLIC_API_URL="https://your-backend-api.onrender.com"
```

---

## 5. Step-by-Step Commands to Run the Application

### Step 1: Install Dependencies

Open a terminal in the project root:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

---

### Step 2: Database Setup & Migration

From the `backend` folder, run Prisma migrations and seed the initial administrator:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema directly to your MySQL database
npm run db:push

# Seed default administrator account (admin@annasetu.org / Admin@123)
npm run seed
```

---

### Step 3: Run the Application

You need two terminal windows (one for the backend and one for the frontend).

#### Terminal 1: Start Backend (Express API Server)
```bash
cd backend
npm run dev
```
* Backend runs at: **`http://localhost:4000`**
* Health check: **`http://localhost:4000/api/health`**

#### Terminal 2: Start Frontend (Next.js Application)
```bash
cd frontend
npm run dev
```
* Frontend runs at: **`http://localhost:3000`**

---

## 6. Production Build & Execution Commands

### 6.1 Build and Run Backend
```bash
cd backend
npm run build
npm start
```

### 6.2 Build and Run Frontend
```bash
cd frontend
npm run build
npm start
```

---

## 7. Quick Testing Credentials & Verification Flow

1. Open **`http://localhost:3000`** in your browser.
2. Sign in as Admin:
   * **Email**: `admin@annasetu.org`
   * **Password**: `Admin@123`
3. Access Admin Dashboard at **`http://localhost:3000/admin`** to review stats, approve pending donor/NGO/volunteer accounts, or manage donations.
4. Open an Incognito window to register a **Donor**, **NGO**, or **Volunteer**, approve the user in the Admin panel, and test the full food claim and OTP verification pipeline.

---

## 8. Summary of NPM Scripts

### Backend (`/backend`)
| Command | Description |
|---|---|
| `npm run dev` | Starts backend development server with auto-reload (`ts-node-dev`) |
| `npm run build` | Compiles TypeScript code to `dist/` |
| `npm start` | Runs compiled production server from `dist/app.js` |
| `npm run db:push` | Syncs Prisma schema with the database without migration files |
| `npm run seed` | Seeds default admin credentials into the database |
| `npx prisma studio` | Launches Prisma GUI to browse and edit database tables |

### Frontend (`/frontend`)
| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle |
| `npm start` | Starts Next.js production server |
| `npm run lint` | Runs ESLint checks |
