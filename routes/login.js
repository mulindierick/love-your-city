import bcrypt from "bcrypt";
import { token } from "../token.js";
import express from "express";
import pool from "../db.js";

import { OAuth2Client } from "google-auth-library";
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

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
      user: { user_id: user.rows[0].user_id },
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { googleToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: CLIENT_ID,
    });
    const { email } = ticket.getPayload();

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.json({ error: "some account details are not correct" });
    }
    res.json({
      token: token(user.rows[0]),
      user: { user_id: user.rows[0].user_id },
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

export default router;
