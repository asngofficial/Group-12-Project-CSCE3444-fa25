### MSSR_GROUP_12_PROJECT_CSCE3444_FA25###
# Sudoku Web Application
TEAM MEMBERS:
Matthew Best
Samuel Afon
Raul Salas
Rual Tling

## Project Description
This is a Sudoku web application featuring multiplayer games, bot challenges, and customizable board themes.

## Local Development Setup

To set up and run the project locally, follow these steps:

### 1. Install Dependencies

First, install dependencies for both the frontend and backend.

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies (from 'server' directory)
cd server
npm install
cd .. 
```

### 2. Environment Configuration

#### Frontend (`.env` in project root)
Create a `.env` file in the **root directory** and add:
```
VITE_API_BASE_URL=http://localhost:3002
```

#### Backend (`.env` in `server` directory)
Create a `.env` file in the **`server` directory** and add a `JWT_SECRET`.
```
JWT_SECRET=your_local_jwt_secret
```
*(Note: `server/.env` is in `.gitignore` to prevent accidental commits.)*

### 3. Run the Application

Start both the backend and frontend servers.

```bash
# Start the backend server
cd server
npm start
```

```bash
# Start the frontend development server
cd ..
npm run dev
```

*   The backend server runs on `http://localhost:3002`.
*   The frontend development server typically runs on `http://localhost:5173`.

### 4. Testing Locally

*   **Register/Login:** Register a new user on the login page (as `db.json` is cleared on setup).
*   **Features:** Test multiplayer, bot challenges, and board theme customization.

## Production Notes (JWT Secret)
For production deployment, replace `your_local_jwt_secret` with a strong, randomly generated secret. Configure this `JWT_SECRET` securely as an environment variable in your hosting platform (e.g., Render).