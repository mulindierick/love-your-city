import bcrypt from "bcrypt";
import { token } from "../token.js";
import express from "express";
import pool from "../db.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { email, password } = req.body;
    //first check if the user has an account already
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.json({ msg: "some account details are not correct" });
    }
    // if user is there, check if the password is correct
    let correctPassword = await bcrypt.compare(password, user.rows[0].password);
    // if password is not correct
    if (!correctPassword) {
      return res.json({ msg: "Password not correct" });
    }
    // if both password and email are correct send validation token
    res.json({
      token: token(user.rows[0]),
      user: user.rows[0]
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// update password.
// enter email so we can check that your account exists
// after we email you a route where you can click to update your password. 


router.post("/password-reset");

export default router;
