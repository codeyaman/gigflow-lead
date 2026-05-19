# Smart Leads Dashboard (GigFlow)

A full-stack lead management platform built using the MERN stack with TypeScript. It allows businesses to track, filter, search, paginate, and export client leads securely.

## Features

- **Authentication System**: JWT-based secure auth with password hashing via `bcrypt`.
- **Role-Based Access Control (RBAC)**: Supports `Admin` and `Sales User` roles. Admin users can delete leads; Sales Users have lead read, create, and update rights only.
- **Lead Management (CRUD)**: Create, read, update, and delete lead data.
- **Advanced Multi-Filter & Search**: Search by name or email combined with filtering by status and source, and sorting by creation date.
- **Debounced Search**: Optimized API requests by debouncing keyboard inputs.
- **CSV Export**: Export filtered/searched datasets as a CSV file.
- **Dark Mode**: Toggle interface themes (Light/Dark) with system detection.
- **Docker Orchestration**: Simple run command using Docker Compose for frontend, backend, and MongoDB.

---

## Technical Stack

- **Frontend**: React, TypeScript, TailwindCSS (v4), Axios, React Router, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Mongoose/MongoDB, Zod (validation), JWT, bcryptjs

---

## Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── config/      # DB Connection
│   │   ├── controllers/ # Auth & Lead Route handlers
│   │   ├── middleware/  # Auth checking & RBAC, Error catcher
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # Express routes
│   │   ├── types/       # Shared interfaces
│   │   └── utils/       # Input validation schemas, Seed script
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Tables, Filters, Modals
│   │   ├── context/     # Auth state context
│   │   ├── hooks/       # custom debouncer hook
│   │   ├── pages/       # Login, Register, Dashboard screens
│   │   └── index.css    # Tailwind styling directives
│   ├── nginx.conf       # SPA Nginx config
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or remote uri)
- Docker & Docker Compose (optional, for containerized run)

### Method 1: Using Docker (Recommended & Simplest)

1. Open your terminal in the root folder of the project.
2. Run the build and start command:
   ```bash
   docker-compose up --build
   ```
3. Once running, open your browser and navigate to:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5001/api](http://localhost:5001/api)

### Method 2: Manual Local Running

#### 1. Backend Setup
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/smart-leads
   JWT_SECRET=super_secret_key_12345
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the database with test accounts and sample leads:
   ```bash
   npm run seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Move to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Seed Accounts (Default Login)

You can log in using either of the following seeded accounts:

### 1. Administrator Account (Admin Role - has Delete permissions)
- **Email**: `admin@gigflow.com`
- **Password**: `password123`

### 2. Sales Account (Sales User Role - standard CRUD only)
- **Email**: `sales@gigflow.com`
- **Password**: `password123`

---

## API Documentation

All routes expect JSON payloads. Authenticated requests require a `Bearer <token>` inside the `Authorization` header.

### Authentication Endpoints

#### `POST /api/auth/register`
Creates a new account.
- **Request Body** (Note: Specifying `"Admin"` as a role is blocked; all registrations default to `"Sales User"`):
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "USER_ID",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "Sales User"
    }
  }
  ```

#### `POST /api/auth/login`
Signs in an existing user.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same format as registration response.

---

### Leads Management Endpoints (All Auth Protected)

#### `GET /api/leads`
Lists leads with support for filtering, search, and sorting.
- **Query Params**:
  - `page`: Page index (integer, e.g. `2`). Defaults to `1`. Returns 10 records per page.
  - `search`: Searches lead names or emails (case-insensitive substring match).
  - `status`: Filter by status (`New`, `Contacted`, `Qualified`, `Lost`).
  - `source`: Filter by source (`Website`, `Instagram`, `Referral`).
  - `sort`: Sorting order (`latest` or `oldest`). Defaults to `latest`.
- **Response**:
  ```json
  {
    "leads": [
      {
        "_id": "LEAD_ID",
        "name": "Rahul Kumar",
        "email": "rahul@example.com",
        "status": "Qualified",
        "source": "Instagram",
        "createdBy": {
          "_id": "USER_ID",
          "name": "Sales Rep",
          "email": "sales@gigflow.com",
          "role": "Sales User"
        },
        "createdAt": "2026-05-19T12:00:00.000Z",
        "updatedAt": "2026-05-19T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1,
      "limit": 10
    }
  }
  ```

#### `POST /api/leads`
Creates a new lead.
- **Request Body**:
  ```json
  {
    "name": "Sarah Miller",
    "email": "sarah@example.com",
    "status": "New",
    "source": "Website"
  }
  ```

#### `GET /api/leads/:id`
Retrieves a single lead's full details.

#### `PUT /api/leads/:id`
Updates an existing lead.
- **Request Body**: Same format as creation.

#### `DELETE /api/leads/:id`
Deletes a lead from the database. **Only accessible to Admins.**

#### `GET /api/leads/export`
Exports all leads matching the active filters (`search`, `status`, `source`, `sort`) in CSV format.
- **Response Header**: `Content-Type: text/csv`
- **Response Body**: Streamed text file content.
