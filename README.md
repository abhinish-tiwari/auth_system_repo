# Auth System Repo

A full-stack authentication system with a **React + Vite + TypeScript** frontend and an **Express + TypeScript + MongoDB** backend.

## Overview

This repository contains two applications:

- **`auth-frontend`** — user interface built with React, Vite, TypeScript, Tailwind CSS, Axios, and React Router
- **`auth-backend`** — REST API built with Express, TypeScript, Mongoose, JWT, bcrypt, and security middleware

The backend exposes authentication and user-profile routes, and the frontend consumes the API through a configurable base URL.

## Features

- User registration
- User login
- Token refresh flow
- Logout
- Protected user profile endpoint
- MongoDB-backed data layer
- JWT-based authentication
- Rate limiting, CORS, Helmet, and cookie parsing on the server
- Type-safe frontend and backend codebases

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JWT
- bcrypt
- zod
- cors
- helmet
- cookie-parser
- express-rate-limit

## Project Structure

```text
auth_system_repo/
├── auth-backend/
└── auth-frontend/
```

## Backend API

### Public routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/health`

### Protected routes
- `GET /api/users/profile`

## Environment Variables

### Backend (`auth-backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/auth_demo
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:5173
```

### Frontend (`auth-frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Getting Started

### 1) Clone the repository
```bash
git clone https://github.com/abhinish-tiwari/auth_system_repo.git
cd auth_system_repo
```

### 2) Start the backend
```bash
cd auth-backend
npm install
npm run dev
```

### 3) Start the frontend
```bash
cd ../auth-frontend
npm install
npm run dev
```

## Available Scripts

### Backend
```bash
npm run dev
npm run build
npm start
```

### Frontend
```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The backend expects a valid MongoDB connection string and a `CLIENT_URL` that matches the frontend origin.
- The backend uses CORS with credentials enabled, so frontend and backend should be configured with matching local URLs during development.
- The frontend README in `auth-frontend/` is still the default Vite template; this root README describes the full repository.

## License

MIT
