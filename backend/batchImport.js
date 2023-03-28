const { MongoClient } = require("mongodb");
const { flights, reservations } = require("./data.js");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

// First transform the data into a usable format since the insertMany method requires an array of objects
// Flights array:
const flightsArray = [];

// transform the data:
for (const [flightNumber, seats] of Object.entries(flights)) {
  const flight = { _id: flightNumber, flightNumber, seats };
  flightsArray.push(flight);
}

// connect to the database
const flightsData = async () => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    client.connect();
    const db = client.db("Slingair_DB");
    const flightsCollection = await db
      .collection("flights")
      .insertMany(flightsArray);
  } catch (err) {
    console.log("Error importing flights data:", err.message);
  }
  client.close();
  console.log("Successfully imported flights data");
};

const reservationsData = async () => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    client.connect();
    const db = client.db("Slingair_DB");
    const reservationsCollection = await db
      .collection("reservations")
      .insertMany(reservations);
  } catch (err) {
    console.log("Error importing reservations data:", err.message);
  }
  client.close();
  console.log("Successfully imported reservations data: ");
};

flightsData();
reservationsData();
