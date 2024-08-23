const router = require("express").Router();

const Booking = require("../models/Booking");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, listingId, hostId, startDate, endDate, totalPrice } =
      req.body;

    const newBooking = new Booking({
      customerId,
      listingId,
      hostId,
      startDate,
      endDate,
      totalPrice,
    });

    await newBooking.save();

    await Listing.findByIdAndUpdate(listingId, { isBooked: true });

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
