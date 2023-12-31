const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./night-reserve-firebase-adminsdk-ublke-4f1fc14c3b.json");
const backUpTime = new Date().toLocaleTimeString("da-DK");

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
  const location = data.body.location;
  const periode = data.body.periode;
  try {
    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("lonperioder")
      .doc(periode)
      .set({
        periode: periode,
        latestStempel: dateCode,
      });

    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("lonperioder")

      .doc(periode)
      .collection("stempel")
      .doc(dateCode)
      .set({
        dayDone: false,
        date: dateCode,
        stempelIn: {
          date: dateCode,
          funktion: "stemple Ind",
          time: data.body.time || backUpTime,
          location: location || "ingen lokation",
        },
      })
      .then(() => {
        console.log(`Document successfully written! ${uid}`);
        res.json({
          uid: uid,
          dato: dateCode,
          funktion: "stemple Ind",
          time: data.body.time || backUpTime,
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
  const periode = data.body.periode;
  console.log(data.body.location);
  try {
    admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("lonperioder")
      .doc(periode)
      .collection("stempel")
      .doc(dateCode)
      .update({
        dayDone: true,
        date: dateCode,
        stempelOut: {
          date: dateCode,
          funktion: "stemple Ud",
          time: data.body.time || backUpTime || "ingen tid",
          location: data.body.location || "ingen lokation",
        },
      });

    res.json({
      uid: uid,
      dato: dateCode,
      time: data.body.time || backUpTime,
      function: "stemple Ud",
      location: data.body.location,
    });
  } catch (error) {
    res.json({ error: error });
  }
});

//ekstra stempel ind
app.post("/api/ekstrastempel/ind/:uid", express.json(), (req, res) => {
  console.log(req.body);
  const uid = req.params.uid;

  admin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("lonperioder")
    .doc(req.body.periode)
    .collection("stempel")
    .doc(req.body.date)
    .update({
      dayDone: false,
      date: req.body.date,
      stempelIn: {
        date: req.body.date,
        funktion: "stemple Ind",
        time: req.body.time || backUpTime,
        location: "ingen lokation, ekstra stempel ind",
      },
    });

  res.json({ message: "ok stemple ind" });
});
//ekstra stempel ud
app.post("/api/ekstrastempel/ud/:uid", express.json(), (req, res) => {
  console.log(req.body);
  const uid = req.params.uid;
  admin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("lonperioder")
    .doc(req.body.periode)
    .collection("stempel")
    .doc(req.body.date)
    .update({
      dayDone: true,
      date: req.body.date,
      stempelOut: {
        date: req.body.date,
        funktion: "stemple Ud",
        time: req.body.time || backUpTime || "ingen tid",
        location: "ingen lokation, ekstra stempel ud",
      },
    });

  res.json({ message: `ok stemple ud ${uid}` });
});

const PORT = process.env.PORT || 3003;
// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + ".");
});
