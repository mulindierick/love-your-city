import { validToken } from "../middleware/validate.js";
import pool from "../db.js";
import express from "express";

const router = express.Router();

//create campaign
//  validToken,
router.post("/", validToken, async (req, res) => {
  console.log(req.body)
  const { userId, campName, campDesc, campType, returnedEndDate, deliveryAddress, initialNumItems, campaignItems } = req.body

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const campRes = await client.query(
      "INSERT INTO campaigns(campaign_owner_id, campaign_title, campaign_desc, campaign_type, delivery_address, end_date, required_item_total) values ($1::uuid, $2,$3, $4, $5, $6, $7) returning campaign_id",
      [userId, campName, campDesc, campType, deliveryAddress, returnedEndDate, initialNumItems]
    )
    const campId = await campRes.rows[0]["campaign_id"]
    console.log(campId)

    for await (const item of campaignItems) {
      client.query(
        'INSERT INTO campaign_items(campaign_id, campaign_item_name, campaign_item_quantity) VALUES ($1::uuid, $2, $3)',
        [campId, item.item, item.quantity]
      )
    }

    await client.query('COMMIT')
    res.status(200).json({ msg: "campaign created", campId });
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
    res.status(500).json({ error: error.message });
  } finally {
    client.release()
  }
});

// get one campaign by id -- read campaign details
router.get("/:id", validToken, async (req, res) => {
  try {
    let campaign = await pool.query(
      `select * from campaigns where campaign_id = '${req.params.id}'`
    );
    res.json(campaign.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//donate to a campaign
router.post("/:id", validToken, async (req, res) => {
  try {
    let campaign = await pool.query(
      `select * from campaigns where campaign_id = '${req.params.id}'`
    );
    if (campaign.rows.length === 0) {
      return res.json({ msg: "Campaign not found" });
    }
    console.log(req.body)
    await req.body.forEach((donation) => {
      pool.query(
        "insert into donations (donation_owner_id, campaign_id, item_name, item_quanity) values($1, $2, $3, $4)",
        [req.user.user_id, req.params.id, donation.name, donation.quantity]
      );
    });
    res.json({ msg: "Thank you for donating" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update a campaign
router.patch("/:id", validToken, async (req, res) => {
  try {
    console.log(req.user);
    let campaign = await pool.query(
      `select * from campaigns where campaign_id = '${req.params.id}'`
    );
    if (campaign.rows.length === 0) return res.json({ msg: "no campaign" });

    if (campaign.rows[0].campaign_owner_id === req.user.user_id) {
      await pool.query(
        `update campaigns set campaign_title = $1, campaign_desc = $2 where campaign_id = '${req.params.id}'`,
        [req.body.title, req.body.desc]
      );
      res.json({ updated: campaign.rows[0].campaign_id });
    } else {
      return res.json({ msg: "campaign not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

// delete a campaign
router.delete("/:id", validToken, async (req, res) => {
  try {
    let campaign = await pool.query(
      `select * from campaigns where campaign_id = '${req.params.id}'`
    );
    if (campaign.rows.length === 0) return res.json({ msg: "no campaign" });

    if (campaign.rows[0].campaign_owner_id === req.user.user_id) {
      await pool.query(
        `delete from campaigns where campaign_id = '${req.params.id}'`
      );
      res.json({ deleted: campaign.rows[0].campaign_id });
    } else {
      return res.json({ msg: "campaign not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

export default router;
