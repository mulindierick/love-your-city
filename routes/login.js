import bcrypt from "bcrypt";
import { token } from "../token.js";
import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

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

// google auth

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
      return res.json({ error: "some account details are incorrect" });
    }
    res.json({
      token: token(user.rows[0]),
      user: { user_id: user.rows[0].user_id },
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// send passowrd reset url
router.post("/psw-reset-url", async (req, res) => {
  try {
    //first check if the user has an account already
    // const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    //   req.body.email,
    // ]);
    // if (user.rows.length === 0) {
    //   return res.json({ msg: "user does not exist" });
    // }
    // // if user exists, send token to email
    // let token = jwt.sign(
    //   user.rows[0],
    //   process.env.ACCESS_TOKEN + user.rows[0].password,
    //   { expiresIn: "15m" }
    // );
    // let resetUrl = ` http://localhost:5000/${token}/${user.rows[0].user_id}`;

    // send reset url to user email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "",
        pass: "",
      },
    });

    const options = {
      from: "mulindi@coburwas.org",
      to: "mulindierick@gmail.com",
      subject: "LYC test",
      text: "it worked",
    };

    transporter.sendMail(options, function (error, res) {
      if(error){
        console.log(error.message)
        return;
      }
      console.log(res.response)
    });
    res.json({msg: "email sent"})


  } catch (error) {
    res.json({ error: error.message });
  }
});

// reset password
router.post("/reset-psw/:userId/:token", async (req, res) => {
  try {
    //check if userID is valid and user is there
    const user = await pool.query(
      "SELECT * FROM users WHERE users.user_id = $1",
      [req.params.userId]
    );
    if (user.rows.length === 0) {
      return res.json({ msg: "bad request" });
    }
    // check if token is valid
    let token = jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN + user.password
    );
    // if token is valid, reset password

    await pool
      .query("UPDATE users SET password=$1 WHERE id=$2", [
        bcrypt.hash(req.body.password, 10),
        req.params.userId,
      ])
      .then(() => res.send(`password updated`))
      .catch((error) => {
        console.error(error);
        res.status(500).json(error);
      });
  } catch (error) {
    res.json({ error: error.message });
  }
});

export default router;
