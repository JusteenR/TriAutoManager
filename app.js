
// Importing express module
const express = require('express');
const app = express();
const path = require("path");
const fs = require("fs");

// constants
const DB_PATH = path.resolve("db.json");

app.use(express.json());

// routes
app.get("/", async (req, res) => {
  fs.readFile(DB_PATH, "utf-8", (err, jsonString) => {
    if (err) return console.log("Error in reading from db");
    let values = JSON.parse(jsonString);
    res.status(200).json({
      totalValues: values.length,
      values,
    });
  });

  // Sending the response
  res.send('Hello World!!!')
    
  // Ending the response
  res.end()

});
app.post("/", async (req, res) => {
  fs.readFile(DB_PATH, "utf-8", (err, jsonString) => {
    if (err) return console.log("Error in reading from db");
    let body = req.body;
    let valuesArr = JSON.parse(jsonString);
    let obj = {
      temperature: body.temperature,
      humidity: body.humidity,
      timestamp: new Date(),
    };
    valuesArr.push(obj);
    fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
      if (err) return console.log("Error in updating db");
      res.status(200).json({
        message: "Values saved",
        value: valuesArr[valuesArr.length - 1],
      });
    });
  });
});

// Establishing the port
const PORT = process.env.PORT ||5000;
 
// Executing the server on given port number
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));