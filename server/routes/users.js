import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
const router = express.Router();

router.get("/", (req, res) => {
  let q = "select * from users";
  pool
    .query(q)
    .then((data) => res.json({ data: data.rows }))
    .catch((err) => console.log(err));
});


export default router;
