const { MongoClient } = require("mongodb");
const flights = require("./data.js");
const reservations = require("./data.js");
const uri =
  "mongodb+srv://slingair:bestairline@cluster0.50bpam6.mongodb.net/Slingair_DB?retryWrites=true&w=majority";
const options = { useNewUrlParser: true, useUnifiedTopology: true };

// connect to the database
const dbFunction = async (dbName) => {
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log("Connected successfully to server - database.js");
    // connect to the database
    const db = client.db(dbName);
    // connect to the collection
    const collection = db.collection("AllFlightInfo");
    console.log("Connected successfully to collection - database.js");
    // insert the data into the database
    const promises = Object.entries(flights).map(async ([datatype, flight]) => {
      // check if the datatype already exists in the database
      const existingDoc = await collection.findOne({ datatype });
      if (existingDoc) {
        console.log(`Skipping ${datatype} - already exists in database`);
        return;
      }
      // insert the new document into the database
      await collection.insertOne({ datatype, flight });
      console.log(`Inserted ${datatype} into database successfully`);
    });
    await Promise.all(promises);
  } catch (err) {
    console.log(err.stack);
  }

  // close the connection
  await client.close();
  console.log("Disconnected from server");
};

// changed the array of reservations from "flight" to "resurvs" in the datatype "reservations" document

module.exports = dbFunction;
