import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { token } from "../token.js";
import { validToken } from "../middleware/validate.js";
const router = express.Router();

// get all users from the database
router.get("/", (req, res) => {
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
    let newUser = await pool.query(
      "insert into users(username, password, email) values($1, $2, $3) RETURNING *",
      [req.body.name, hashedPassword, req.body.email]
    );
    res.status(200).json(token(newUser.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// campaigns a user created
router.get("/:id", validToken, async (req, res) => {
  const client = await pool.connect()

  try {
    if (req.params.id === req.user.user_id) {
      await pool.query('BEGIN')

      const dataCamp = await pool.query(
        `select * from campaigns where campaign_owner_id = '${req.params.id}'`
      );
      const campaigns = await dataCamp.rows

      const dataItems = await pool.query(
        `select * from campaign_items`
      );
      const campaignItems = dataItems.rows

      const dataDonations = await pool.query(
        `select * from donations`
      );
      const campaignDonations = dataDonations.rows
      
      campaigns.forEach((camp) => {
        const { campaign_id: id } = camp

        let specificItems = campaignItems.filter(el => el.campaign_id === id)
        let specificDonations = campaignDonations.filter(el => el.campaign_id === id)

        camp["campaign_items"] = specificItems
        camp["campaign_donations"] = specificDonations
      })

      console.log(campaigns)
      res.json(campaigns);

    } else {
      return res.json({ msg: "Please login" });
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
    res.status(500).json({ error: error.message });
  } finally {
    client.release()
  }
});

export default router;
