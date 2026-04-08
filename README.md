# Travel Guide - Full Stack Application

Welcome to the **Travel Guide** application! This is a full-stack MERN (MongoDB, Express, React, Node.js) project that helps users explore travel destinations, manage itineraries, read or write posts, get AI-generated itineraries, and check weather conditions. This comprehensive guide covers the folder structure, technologies used, and step-by-step installation instructions to confidently set up and run the application locally.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite)
- **React Router DOM** (For routing)
- **Axios** (For API requests)
- **GSAP** (For sophisticated animations)
- **html2canvas / jsPDF** (For exporting itineraries to PDF)
- **React Toastify** (For slick push notifications)

### Backend
- **Node.js & Express.js** (Server framework)
- **MongoDB & Mongoose** (Database & ODM)
- **Cloudinary & Multer** (For handling image/avatar uploads)
- **Bcrypt & JSON Web Tokens (JWT)** (For secure authentication & authorization)
- **Joi** (For input validation)
- **Dotenv** (For managing environment variables)

---

## 📂 Folder Structure

The project has been separated into `frontend` and `backend` directories for a clean separation of concerns.

```text
travel_guide/
├── backend/                   # Node.js + Express backend
│   ├── controller/            # Application logic & handlers for routes
│   ├── middleware/            # Custom logic (Authentication, Validation, etc.)
│   ├── modules/               # Database connection logic (e.g. db.js), Models
│   ├── route/                 # Express API routes (authRoute, userRoute, etc.)
│   ├── index.js               # Entry point of the Express server
│   └── package.json           # Backend dependencies and scripts
│
├── frontend/                  # React + Vite frontend
│   ├── src/                   # React source code
│   │   ├── assets/            # Static assets like images/icons
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Main application views (Home, Login, Dashboard, etc.)
│   │   ├── App.jsx            # Main React component
│   │   ├── index.css          # Vanilla CSS global styles
│   │   └── main.jsx           # React app mounting point
│   ├── dist/                  # Built assets for production
│   └── package.json           # Frontend dependencies and scripts
│
├── vercel.json                # Vercel deployment configuration
├── package.json               # Root workspace file (for running both servers concurrently)
└── README.md                  # Detailed documentation (You are here!)
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have installed the following:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- [Git](https://git-scm.com/)
- A **MongoDB Atlas** database cluster (or local MongoDB installation)
- A **Cloudinary** account to host images

### 1. Clone the repository
Open your terminal and run:
```bash
git clone <repository_url>
cd travel_guide
```

### 2. Install Dependencies
This project utilizes a root `package.json` with the Concurrently module to streamline the developer experience. 

Install the root dependencies:
```bash
npm install
```
Then install the dependencies for both the frontend and the backend individually:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Setup Environment Variables
You will need to create and populate a `.env` file within your `backend/` directory so your server can successfully talk to your database and third-party APIs.

Create the file `backend/.env` and supply your distinct credentials:

```ini
PORT=8080
# MongoDB connection URI
db=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/travel_api?retryWrites=true&w=majority

# Cloudinary Integration (for Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# Third-Party APIs (Optional based on the features you plan on using)
weather_api=your_weather_api_key
HF_TOKEN=your_hugging_face_token
model_id=meta-llama/Meta-Llama-3-8B-Instruct
```

### 4. Running the Application locally
Because the project's root `package.json` contains a `dev` script running concurrently, you can start **both** the frontend and the backend servers with a single command!

From the root directory (`travel_guide/`), type:
```bash
npm run dev
```

This starts the application locally over two terminals:
- The **Backend API** will run on `http://localhost:8080`
- The **Vite Frontend Development** server will generally be available at `http://localhost:5173` (Unless specified otherwise in your console)

You can now use your browser to interact with the frontend interface which successfully interfaces with your Node.js backend.

---

## 🌐 Deployment (Vercel)

The codebase comes preconfigured with a `vercel.json` file designed to assist with deployment to Vercel Serverless Platforms out-of-the-box. 

1. Push your code to your GitHub/GitLab repository.
2. Link the repository to a new Vercel Project.
3. In Vercel Project **Settings -> Environment Variables**, manually inject **all** the keys stored inside your `backend/.env` file. 
4. The deployment will install dependencies via the scripts and automatically utilize `@vercel/static-build` for the frontend and `@vercel/node` for the backend based securely around your settings.

> **Note:** Whenever you use serverless environments (like Vercel) you must configure the IP Whitelist in your MongoDB Atlas Dashboard. In Atlas, under Network Access, set it to **Allow Access From Anywhere (`0.0.0.0/0`)** since Serverless Functions rotate IP addresses dynamically.

---
Happy Coding and Travelling! 🌍✈️