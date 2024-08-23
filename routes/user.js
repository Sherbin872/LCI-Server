const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find trips!", error: err.message });
  }
});

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId).populate("creator");

    const favoriteListing = user.wishList.find(
      (item) => item._id.toString() === listingId
    );

    if (favoriteListing) {
      user.wishList = user.wishList.filter(
        (item) => item._id.toString() !== listingId
      );
      await user.save();
      res.status(200).json({
        message: "Listing is removed from wish list",
        wishList: user.wishList,
      });
    } else {
      user.wishList.push(listing);
      await user.save();
      res.status(200).json({
        message: "Listing is added to wish list",
        wishList: user.wishList,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: err.message });
  }
});

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate(
      "creator"
    );
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find properties!", error: err.message });
  }
});

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find reservations!", error: err.message });
  }
});

// GET ALL USERS FOR ADMIN
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const listingsCount = await Listing.countDocuments({
          creator: user._id,
        });
        const bookingsCount = await Booking.countDocuments({
          hostId: user._id,
        });
        return {
          ...user.toObject(),
          listingsCount,
          bookingsCount,
        };
      })
    );
    res.status(200).json(usersWithCounts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
});

// Delete user by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});

// Get user details by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const listingsCount = await Listing.countDocuments({ creator: id });
    const bookingsCount = await Booking.countDocuments({ hostId: id });

    res.status(200).json({ ...user.toObject(), listingsCount, bookingsCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
});

// GET USER DETAILS AND LISTINGS
router.get("/:userId/details", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    // const listings = await Listing.find({ creator: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user /*, listings */ });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Failed to fetch user details", error: err.message });
  }
});

module.exports = router;
