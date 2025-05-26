const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load .env variables

const app = express();
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "Vims";
const collectionName = process.env.COLLECTION_NAME || "contact-us";

let db;

// Connect to MongoDB once when the server starts
MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// POST /api/contact
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email and message are required" });
  }

  try {
    const result = await db.collection(collectionName).insertOne({
      name,
      email,
      subject: subject || "",
      message,
      createdAt: new Date(),
    });
    console.log("Contact message saved:", result.insertedId);

    res.status(201).json({
      message: "Contact message saved successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
