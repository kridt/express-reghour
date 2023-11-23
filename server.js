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
  console.log(data);
  const location = data.location;

  try {
    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("stempel")
      .doc(dateCode)
      .set({
        stempelIn: {
          date: dateCode,
          funktion: "stemple Ind",
          time: new Date().toLocaleTimeString("da-DK"),
          location: location || "ingen lokation",
        },
      })
      .then(() => {
        console.log(`Document successfully written! ${uid}`);
        res.json({
          uid: uid,
          dato: dateCode,
          funktion: "stemple Ind",
          time: new Date().toLocaleTimeString("da-DK"),
          location: location,
        });
      });
  } catch (error) {
    console.log("error", error);
    res.json({ error: error });
  }

  // Use the data from the request body
});

app.post("/api/checkout/:uid", express.json(), (req, res) => {
  const uid = req.params.uid;
  const dateCode = getDagensDato();

  const data = req.body;

  console.log(data.body.location);
  try {
    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("stempel")
      .doc(dateCode)
      .update({
        stempelOut: {
          date: dateCode,
          funktion: "stemple Ud",
          time: new Date().toLocaleTimeString("da-DK"),
          location: location || "ingen lokation",
        },
      });

    res.json({
      uid: uid,
      dato: dateCode,
      time: new Date().toLocaleTimeString("da-DK"),
      function: "stemple Ud",
      location: location,
    });
  } catch (error) {
    res.json({ error: error });
  }
});

const PORT = process.env.PORT || 3003;
// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + ".");
});
