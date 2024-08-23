const express = require("express");
const cron = require("node-cron");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const settingsRoutes = require("./routes/settings.js");

const Listing = require("./models/Listing");
const Setting = require("./models/Setting");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/settings", settingsRoutes);

/* MONGOOSE SETUP */
const PORT = 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "LCI",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));

// Schedule the task to run daily
cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight
  const setting = await Setting.findOne({ key: "expiryPeriodDays" });
  const expiryDays = setting ? setting.value : 3; // Default to 3 days

  const now = new Date();
  const expiryDate = new Date(now.getTime() - expiryDays * 24 * 60 * 60 * 1000);

  try {
    const result = await Listing.deleteMany({
      createdDate: { $lt: expiryDate },
    });
    console.log(`Deleted ${result.deletedCount} old listings`);
  } catch (err) {
    console.error("Error deleting old listings:", err);
  }
});
