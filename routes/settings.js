const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");

// Endpoint to get expiry period
router.get("/expiry-period", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "expiryPeriodDays" });
    res.json({ expiryDays: setting ? setting.value : 3 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expiry period" });
  }
});

// Endpoint to update expiry period
router.post("/expiry-period", async (req, res) => {
  const { expiryDays } = req.body;

  try {
    await Setting.findOneAndUpdate(
      { key: "expiryPeriodDays" },
      { value: expiryDays },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expiry period" });
  }
});

module.exports = router;
