"use strict";
//imports
const { MongoClient } = require("mongodb");

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
    console.log("Connected correctly to server - getflights handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("AllFlightInfo");
    const documents = await collection.find({}).toArray();

    const flightNumbers = documents.reduce((acc, doc) => {
      Object.keys(doc.flight).forEach((key) => {
        if (!isNaN(key)) return; // skip index keys
        acc.push(key);
      });
      return acc;
    }, []);

    client.close();
    res.status(200).json({ flightNumbers });
    console.log(flightNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving flight numbers" });
  }
};

// returns all the seats on a specified flight
const getFlight = (req, res) => {};

// returns all reservations
const getReservations = (req, res) => {};

// returns a single reservation
const getSingleReservation = (req, res) => {};

// creates a new reservation
const addReservation = (req, res) => {};

// updates a specified reservation
const updateReservation = (req, res) => {};

// deletes a specified reservation
const deleteReservation = (req, res) => {};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
