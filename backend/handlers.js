"use strict";
//imports
const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://slingair:bestairline@cluster0.50bpam6.mongodb.net/Slingair_DB?retryWrites=true&w=majority";
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const client = new MongoClient(uri, options);

const dbFunction = require("./database.js");

//________________________________________________________________

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

// returns an array of all flight numbers
const getFlights = async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to server - getflight(s) handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");
    const documents = await collection
      .find({}, { flight: 1, _id: 0 })
      .toArray();

    const flightNumbers = Object.keys(documents[0].flight);

    client.close();
    res.status(200).json({ res: 200, data: flightNumbers });
    console.log(documents);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error retrieving flight numbers" });
  }
};
// ---------------------------------------------^^Done^^---------------------------------------------

// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const flightNumber = req.params;

  try {
    await client.connect();
    console.log("Connected correctly to server - getFlight handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");
    const document = await collection.findOne({});

    const flightData = document.flight[flightNumber.flight];

    client.close();
    res.status(200).json({ flightData });
    console.log(flightData);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error retrieving flight data" });
  }
};
// ---------------------------------------------^^Done^^---------------------------------------------

// returns all reservations
const getReservations = async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to server - getReservations handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");

    const documents = await collection
      .find({ resurvs: { $type: "array" } })
      .toArray();
    const reservations = documents.map((doc) => doc.resurvs);

    client.close();
    res.status(200).json({ reservations });
    console.log(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving resurvations data" });
  }
};

// ---------------------------------------------^^Done^^---------------------------------------------

// returns a single reservation
const getSingleReservation = async (req, res) => {
  const _id = req.params.reservation;
  try {
    await client.connect();
    console.log("Connected correctly to server - getSingleReservation handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");
    const documents = await collection.findOne({ resurvs: { $type: "array" } });

    const resurvation = documents.resurvs.find((doc) => doc._id === _id);

    client.close();
    res.status(200).json({ resurvation });
    console.log(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving reservation data" });
  }
};

// ---------------------------------------------^^Done^^---------------------------------------------

// creates a new reservation
const addReservation = async (req, res) => {
  const { flight, seat, givenName, surname, email } = req.body;
  const reservationId = uuidv4();

  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");

    const document = await collection.findOne({ datatype: "flights" });

    if (!document) {
      throw new Error("Flight not found");
    }

    const flightData = document.flight[flight];
    const seatIndex = flightData.findIndex((seatObj) => seatObj.id === seat);
    if (seatIndex === -1) {
      throw new Error("Seat not found");
    }
    flightData[seatIndex].isAvailable = false;

    const newReservation = {
      _id: reservationId,
      flight,
      seat,
      givenName,
      surname,
      email,
    };

    await collection.updateOne(
      { datatype: "flights" },
      {
        $set: {
          [`flight.${flight}`]: flightData,
        },
        $push: {
          resurvs: newReservation,
        },
      }
    );

    client.close();
    res.status(201).json(newReservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error adding reservation" });
  }
};

// ---------------------------------------------^^Done^^---------------------------------------------

// updates a specified reservation
const updateReservation = async (req, res) => {
  const id = req.params.id; // get the reservation ID from the request parameters
  const { seat, givenName, surname, email } = req.body; // get the updated reservation information from the request body
  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");
    const updateQuery = {};
    if (seat !== undefined) {
      updateQuery["resurvs.$.seat"] = seat;
    }
    if (givenName !== undefined) {
      updateQuery["resurvs.$.givenName"] = givenName;
    }
    if (surname !== undefined) {
      updateQuery["resurvs.$.surname"] = surname;
    }
    if (email !== undefined) {
      updateQuery["resurvs.$.email"] = email;
    }
    const result = await collection.updateOne(
      { "resurvs._id": id },
      { $set: updateQuery }
    );
    client.close();
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating reservation" });
  }
};

// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const id = req.params.reservation; // get the reservation ID from the request parameters

  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");

    const result = await collection.updateOne(
      { "resurvs._id": id },
      { $pull: { resurvs: { _id: id } } }
    );

    client.close();

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error deleting reservation" });
  }
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
