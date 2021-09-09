import { validToken } from "../middleware/validate.js";
import pool from "../db.js";
import express from "express";

const router = express.Router();

//create campaign

router.post("/", validToken, async (req, res) => {
  try {
      console.log(req.user)
    await pool.query(
      "insert into campaigns(campaign_owner_id, campaign_title, campaign_desc) values($1, $2, $3)",
      [req.user.user_id, req.body.title, req.body.desc]
    );
    res.json({ msg: "campaign created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    await pool.query(
      "insert into donations (donation_owner_id, campaign_id, item_name, item_quanity) values($1, $2, $3, $4)",
      [req.user.user_id, req.params.id, req.body.name, req.body.quantity]
    );
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
