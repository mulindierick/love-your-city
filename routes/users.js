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
  try {
    let campaigns = await pool.query(
      `select campaigns.campaign_title, campaigns.campaign_type, campaigns.campaign_desc, campaigns.delivery_address,
      campaigns.end_date
      from campaigns where campaigns.campaign_owner_id = '${req.params.id}'
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
    let donation_items = await pool.query(`
    select campaigns.campaign_title, donations.item_name, donations.item_quantity from campaigns 
      inner join donations
      on campaigns.campaign_id = donations.campaign_id 
      where campaigns.campaign_owner_id = '${req.params.id}'
      ORDER BY campaigns.campaign_title ASC `)
    res.json({
      campaigns: campaigns.rows,
      item_total: item_total.rows,
      campaign_items: campaign_items.rows,
      donations_total: donations_total.rows,
      donation_items: donation_items.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// const client = await pool.connect();

// try {
//   if (req.params.id === req.user.user_id) {
//     await pool.query("BEGIN");

//     const dataCamp = await pool.query(
//       `select * from campaigns where campaign_owner_id = '${req.params.id}'`
//     );
//     const campaigns = await dataCamp.rows;

//     const dataItems = await pool.query(`select * from campaign_items`);
//     const campaignItems = dataItems.rows;

//     const dataDonations = await pool.query(`select * from donations`);
//     const campaignDonations = dataDonations.rows;

//     campaigns.forEach((camp) => {
//       const { campaign_id: id } = camp;

//       let specificItems = campaignItems.filter((el) => el.campaign_id === id);
//       let specificDonations = campaignDonations.filter(
//         (el) => el.campaign_id === id
//       );

//       camp["campaign_items"] = specificItems;
//       camp["campaign_donations"] = specificDonations;
//     });

//     console.log(campaigns);
//     res.json(campaigns);
//   } else {
//     return res.json({ msg: "Please login" });
//   }
// } catch (error) {
//   await client.query("ROLLBACK");
//   throw error;
//   res.status(500).json({ error: error.message });
// } finally {
//   client.release();
// }

export default router;
