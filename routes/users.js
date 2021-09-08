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

router.post("/", (req, res) => {
  let { name, password, email } = req.body;
  let q = "insert into users(username, password, email) values($1, $2, $3)";
  pool
    .query(q, [name, password, email])
    .then((data) => res.json({ msg: "user created" }))
    .catch((e) => console.log(e));
});

export default router;
