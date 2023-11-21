const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Enable CORS
app.use(cors());

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello, World! get");
});

app.post("/api/checkin/:uid", (req, res) => {
  const uid = req.params.uid;

  res.send(`Hello, World! post uid: ${uid}`);
});

const PORT = process.env.PORT || 3003;
// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + ".");
});
