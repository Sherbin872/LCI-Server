const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking"); // Make sure to import the Booking model

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files;

    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    await newListing.save();

    res.status(200).json(newListing);
  } catch (err) {
    res
      .status(409)
      .json({ message: "Fail to create Listing", error: err.message });
    console.log(err);
  }
});

/* GET LISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const listings = await Listing.find(filter)
      .sort({ isFeatured: -1 })
      .populate("creator");
    res.status(200).json(listings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch listings", error: err.message });
  }
});

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;

  try {
    let listings = [];

    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }

    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    const bookings = await Booking.find({ listingId: listingId });

    res.status(200).json({ listing, bookings });
  } catch (err) {
    res
      .status(404)
      .json({ message: "Listing can not found!", error: err.message });
  }
});

router.patch("/feature/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const listings = await Listing.updateMany(
      { creator: userId },
      { $set: { isFeatured: true } }
    );
    res.status(200).json({ message: "User's listings have been featured" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to feature listings", error: error.message });
  }
});

router.patch("/toggle-feature/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const listings = await Listing.find({ creator: userId });
    const areAllFeatured = listings.every((listing) => listing.isFeatured);

    await Listing.updateMany(
      { creator: userId },
      { $set: { isFeatured: !areAllFeatured } }
    );

    res.status(200).json({
      message: areAllFeatured ? "Listings unfeatured" : "Listings featured",
      isFeatured: !areAllFeatured,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle feature listings",
      error: error.message,
    });
  }
});

module.exports = router;
