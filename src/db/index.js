// src/db/index.js

import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // Production (Render + Neon)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local development (pgAdmin/Postgres)
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log("Using local database credentials");
}

export default pool;
