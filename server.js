const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./night-reserve-firebase-adminsdk-ublke-4f1fc14c3b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function getDagensDato() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

// Enable CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello, World! get");
});

app.post("/api/checkin/:uid", express.json(), (req, res) => {
  const uid = req.params.uid;
  const data = req.body;
  const dateCode = getDagensDato();
  const stempleInData = {
    time: new Date().toLocaleTimeString("da-DK"),
    date: dateCode,
    funktion: "stemple Ind",
    lokation: {
      lat: data.latitude,
      lng: data.longitude,
    },
  };
  console.log(data);
  try {
    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("stempel")
      .doc(dateCode)
      .set(stempleInData)
      .then(() => {
        console.log(`Document successfully written! ${uid}`);
        res.json({ uid: uid, data: data, dateCode: getDagensDato() });
      });
  } catch (error) {
    console.log("error", error);
    res.json({ error: error });
  }

  // Use the data from the request body

  res.json({ uid: uid, data: data });
});

const PORT = process.env.PORT || 3003;
// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + ".");
});
