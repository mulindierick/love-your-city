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

router.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query(
      "insert into users(username, password, email) values($1, $2, $3)",
      [req.body.name, hashedPassword, req.body.email]
    );
    res.json({ msg: "user created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
