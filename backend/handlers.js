"use strict";
//mongo shtuff - put it at the top so it makes each function easier to read
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const client = new MongoClient(MONGO_URI, options);
const { ObjectId } = require("mongodb");
//________________________________________________________________

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

// returns an array of all flight numbers
const getFlights = async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to server - getflight(s) handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("flights");
    const allFlights = await collection.find().toArray();
    const flightNumbers = allFlights.map((flight) => flight.flightNumber);

    client.close();
    res.status(200).json({ res: 200, data: flightNumbers });
    console.log(flightNumbers);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ status: 400, message: "Error retrieving flight numbers" });
  }
};
// ---------------------------------------------^^Done^^---------------------------------------------

// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const flightNumber = req.params.flight;
  console.log("Flight number sent through params: " + flightNumber);
  try {
    await client.connect();
    console.log("Connected correctly to server - getFlight handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("flights");
    const flight = await collection.findOne({ flightNumber });

    client.close();
    if (!flight) {
      console.log("Error: User requested a flight number that doesn't exist");
      return res.status(404).json({ message: "Flight not found" });
    }
    res.status(200).json({ res: 200, data: flight });
    console.log(flight.seats);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ status: 400, message: "Error retrieving flight data" });
  }
};
// ---------------------------------------------^^Done^^---------------------------------------------

// returns all reservations
const getReservations = async (req, res) => {
  try {
    await client.connect();
    console.log("Connected correctly to server - getReservations handler");

    const db = client.db("Slingair_DB");
    const collection = db.collection("reservations");

    const reservations = await collection.find().toArray();

    client.close();
    res.status(200).json({ status: 200, reservations });
    console.log(reservations);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ status: 400, message: "Error retrieving resurvations data" });
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
    const collection = db.collection("reservations");
    const reservationById = await collection.findOne({ _id });

    if (!reservationById) {
      console.log("Error: User requested a reservation that doesn't exist");
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }
    res.status(200).json({ reservationById });
    console.log(reservationById);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 500, message: "Error retrieving reservation data" });
  }
  client.close();
};

// ---------------------------------------------^^Done^^---------------------------------------------

// creates a new reservation
const addReservation = async (req, res) => {
  const { flight, seat, givenName, surname, email } = req.body;

  // check to make sure the body sent has givenName and surname and email
  if (!givenName) {
    return res
      .status(400)
      .json({ status: 400, message: "Please provide a givenName" });
  }

  if (!surname) {
    return res
      .status(400)
      .json({ status: 400, message: "Please provide a surname" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ status: 400, message: "Please provide an email" });
  }
  //randomly generated id
  const reservationId = uuidv4();

  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const flightsCollection = db.collection("flights");
    const reservationsCollection = db.collection("reservations");

    const flightDoc = await flightsCollection.findOne({ flightNumber: flight });

    if (!flightDoc) {
      throw new Error("Flight doesn't exist");
    }

    const seatObj = flightDoc.seats.find((seatObj) => seatObj.id === seat);

    if (!seatObj) {
      throw new Error("Seat doesnt exist");
    }

    if (!seatObj.isAvailable) {
      throw new Error("Seat already taken");
    }

    const newReservation = {
      _id: reservationId,
      flight,
      seat,
      givenName,
      surname,
      email,
    };

    await Promise.all([
      flightsCollection.updateOne(
        { flightNumber: flight, "seats.id": seat },
        { $set: { "seats.$.isAvailable": false } }
      ),
      reservationsCollection.insertOne(newReservation),
    ]);

    res.status(201).json({
      status: 201,
      data: newReservation,
      message: "Reservation created",
    });
    console.log(newReservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: 400, message: error.message });
    client.close();
  }
};

// ---------------------------------------------^^Done^^---------------------------------------------

// updates a specified reservation
const updateReservation = async (req, res) => {
  const id = req.params.id;
  const { seat, givenName, surname, email } = req.body;

  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const flightsCollection = db.collection("flights");
    const reservationsCollection = db.collection("reservations");

    const reservation = await reservationsCollection.findOne({
      _id: id,
    });
    if (!reservation) {
      res.status(404).json({ status: 404, message: "Reservation not found" });
      return;
    }

    const flight = await flightsCollection.findOne({
      flightNumber: reservation.flight,
    });
    if (!flight) {
      res.status(404).json({ status: 404, message: "Flight not found" });
      return;
    }

    const requestedSeat = flight.seats.find((s) => s.id === seat);
    if (seat && (!requestedSeat || !requestedSeat.isAvailable)) {
      res.status(400).json({ status: 400, message: "Seat already taken" });
      return;
    }

    const updateQuery = {};
    if (seat) {
      // If the seat is being updated, mark the old seat as available
      if (reservation.seat) {
        const oldSeat = flight.seats.find((s) => s.id === reservation.seat);
        if (oldSeat) {
          oldSeat.isAvailable = true;
        }
      }

      // Mark the new seat as unavailable
      requestedSeat.isAvailable = false;
      updateQuery["seat"] = seat;
    }
    if (givenName) {
      updateQuery["givenName"] = givenName;
    }
    if (surname) {
      updateQuery["surname"] = surname;
    }
    if (email) {
      updateQuery["email"] = email;
    }

    await reservationsCollection.updateOne({ _id: id }, { $set: updateQuery });
    await flightsCollection.updateOne(
      { flightNumber: reservation.flight },
      { $set: { seats: flight.seats } }
    );
    client.close();
    res
      .status(200)
      .json({ status: 200, message: "Reservation updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Server error" });
  }
};

// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const reservationId = req.params.reservation;

  try {
    await client.connect();
    const db = client.db("Slingair_DB");
    const flightsCollection = db.collection("flights");
    const reservationsCollection = db.collection("reservations");

    const reservation = await reservationsCollection.findOne({
      _id: reservationId,
    });
    if (!reservation) {
      res.status(404).json({ status: 404, message: "Reservation not found" });
      return;
    }

    const flight = await flightsCollection.findOne({
      flightNumber: reservation.flight,
    });
    if (!flight) {
      res.status(404).json({ status: 404, message: "Flight not found" });
      return;
    }

    const seat = flight.seats.find((s) => s.id === reservation.seat);
    if (!seat) {
      res.status(404).json({ status: 404, message: "Seat not found" });
      return;
    }

    seat.isAvailable = true;

    await reservationsCollection.deleteOne({
      _id: reservationId,
    });
    await flightsCollection.updateOne(
      { flightNumber: reservation.flight },
      { $set: { seats: flight.seats } }
    );
    client.close();
    res.status(200).json({
      status: 200,
      message: `Reservation with the email of: ${reservation.email} has been successfully deleted`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Server error" });
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
