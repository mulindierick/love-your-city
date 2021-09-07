// connect to server to the database here
import dotenv from "dotenv"; // this will help use set up envirnment viriables
dotenv.config();

import pg from "pg"; // pg will help use connect to db
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: !isProduction ? isProduction : { rejectUnauthorized: false },
});
export default pool;
