import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { token } from "../token.js";
import { validToken } from "../middleware/validate.js";

import { OAuth2Client } from "google-auth-library";
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const router = express.Router();

// get all users from the database
// router.get("/", (req, res) => {
//   let q = "select * from users";
//   pool
//     .query(q)
//     .then((data) => res.json({ data: data.rows }))
//     .catch((err) => console.log(err));
// });

//create a user
router.post("/", async (req, res) => {
  try {
    if (
      req.body.name.length > 0 &&
      req.body.email.length > 0 &&
      req.body.password.length > 0
    ) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let newUser = await pool.query(
        "insert into users(username, password, email) values($1, $2, $3) RETURNING *",
        [req.body.name, hashedPassword, req.body.email]
      );
      res.status(200).json(token(newUser.rows[0]));
    } else {
      res.status(200).json({ error: "some fields are empty" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//use google to create user
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const { family_name, given_name, email, picture } = ticket.getPayload();
    const generatePassword = Math.random() + email;
    const hashPassword = await bcrypt.hash(generatePassword, 10);

    await pool.query(
      "insert into users(username, password, email) values($1, $2, $3)",
      [given_name, hashPassword, email]
    );
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// campaigns a user created
router.get("/:id", validToken, async (req, res) => {
  try {
    let campaigns = await pool.query(
      `select campaigns.campaign_title, campaigns.contact, campaigns.campaign_type, campaigns.campaign_desc, campaigns.delivery_address,
      campaigns.end_date,
      campaigns.campaign_id,
      users.email,
      users.username
      from campaigns
      inner join users
      on campaigns.campaign_owner_id = users.user_id
      where campaigns.campaign_owner_id = '${req.params.id}'
      ORDER BY campaigns.campaign_title ASC`
    );
    let item_total = await pool.query(
      `select campaigns.campaign_title, sum(campaign_items.campaign_item_quantity) as total from campaigns 
        inner join campaign_items
        on campaigns.campaign_id = campaign_items.campaign_id 
        where campaigns.campaign_owner_id = '${req.params.id}'
        group by campaigns.campaign_title
        ORDER BY campaigns.campaign_title ASC
        `
    );
    let campaign_items = await pool.query(
      `select campaigns.campaign_title, campaign_items.campaign_item_name, campaign_items.campaign_item_quantity from campaigns 
      inner join campaign_items
      on campaigns.campaign_id = campaign_items.campaign_id 
      where campaigns.campaign_owner_id = '${req.params.id}'
      ORDER BY campaigns.campaign_title ASC `
    );
    let donations_total = await pool.query(`
      select campaigns.campaign_title, sum(donations.item_quantity) as total from campaigns 
      inner join donations
      on campaigns.campaign_id = donations.campaign_id
      where campaigns.campaign_owner_id = '${req.params.id}'
      group by campaigns.campaign_title
      ORDER BY campaigns.campaign_title asc`);

    // this query needs to change
    let donation_items = await pool.query(`
    select campaigns.campaign_title, donations.donation_id, donations.item_name, donations.item_quantity, coalesce(donations.donations_received, 0) as donations_received, donations.created_at, donations.email, donations.first_name, donations.second_name from campaigns 
      inner join donations
      on campaigns.campaign_id = donations.campaign_id 
      where campaigns.campaign_owner_id = '${req.params.id}'
      ORDER BY campaigns.campaign_title ASC `);
    res.json({
      campaigns: campaigns.rows,
      item_total: item_total.rows,
      campaign_items: campaign_items.rows,
      donations_total: donations_total.rows,
      donation_items: donation_items.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update received items
router.patch("/received_donations", validToken, async (req, res) => {
  try {
    // console.log(req.user);
    let donation = await pool.query(
      `select * from donations where donation_id = '${req.body.donationId}'`
    );
    if (donation.rows.length === 0)
      return res.json({ msg: "donation does not exist" });

    if (donation.rows[0].campaign_id === req.body.campaignId) {
      let updatedDonation = donation.rows[0].donations_received;
      if (
        donation.rows[0].donations_received + req.body.updatedDonationValue <=
        donation.rows[0].item_quantity
      ) {
        updatedDonation += req.body.updatedDonationValue;
      }
      console.log(req.body.updatedDonationValue, updatedDonation);
      await pool.query(
        `update donations set donations_received = $1 where donation_id = '${req.body.donationId}'`,
        [updatedDonation]
      );

      res.json({ receivedDonations: updatedDonation });
    } else {
      return res.json({ msg: "donation not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});
export default router;
