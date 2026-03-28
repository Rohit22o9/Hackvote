# 🗳️ College Hackathon Voting System

A modern, responsive, and secure full-stack voting platform designed for college hackathons.

## 📂 Project Structure
-   `/frontend`: Frontend assets (HTML, CSS, JS) - Served as static files from the backend.
-   `/backend`: Backend logic (Node.js/Express/MongoDB)
    -   `server.js`: Main entry point
    -   `models/`: Mongoose schemas
    -   `routes/`: API endpoints
    -   `controllers/`: Business logic
    -   `seed.js`: Initial project seeder

## 🛠️ Installation & Setup

1.  **Navigate to backend folder**:
    ```bash
    cd backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Seed Initial Data (70 Projects)**:
    ```bash
    npm run seed
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```

The application will be accessible at: `http://localhost:5000`
