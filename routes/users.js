import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { validToken } from "../middleware/validate.js";
const router = express.Router();

// get all users from the database
router.get("/", validToken, (req, res) => {
  console.log(req.user, req.user.user_id);
  let q = "select * from users";
  pool
    .query(q)
    .then((data) => res.json({ data: data.rows }))
    .catch((err) => console.log(err));
});

//create a user
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

// campaigns a user created
router.get("/:id", validToken, async (req, res) => {
  try {
    if (req.params.id === req.user.user_id) {
      let campaigns = await pool.query(
        `select * from campaigns where campaign_owner_id = '${req.params.id}'`
      );
      res.json(campaigns.rows);
    } else {
      return res.json({ msg: "Please login" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
