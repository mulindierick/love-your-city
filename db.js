import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  // connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  // ssl: !isProduction ? isProduction : { rejectUnauthorized: false },
});
export default pool;
