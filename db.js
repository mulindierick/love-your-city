// connect to server to the database here
import dotenv from "dotenv"; // this will help use set up envirnment viriables
dotenv.config();

import pg from "pg"; // pg will help use connect to db
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString:
    "postgres://aubtxyekeokptl:51e5c5ded04a37e55cd73181931710f7da4873b0298f8c4d2631a1bc049fc88f@ec2-52-71-161-140.compute-1.amazonaws.com:5432/d1387q47ffaadr",
  ssl: { rejectUnauthorized: false },
});
export default pool;
