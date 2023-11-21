const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Enable CORS
app.use(
  cors({
    origin: "*",
  })
);

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello, World! get");
});

app.post("/api/checkin/:uid", express.json(), (req, res) => {
  const uid = req.params.uid;
  const data = req.body;

  // Use the data from the request body

  res.json({ uid: uid, data: data });
});

const PORT = process.env.PORT || 3003;
// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + ".");
});
