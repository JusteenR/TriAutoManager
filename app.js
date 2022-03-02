
// Importing express module
const express = require('express');
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");

app.use(cors());

app.use(express.json());
var temp = 0
 
// Getting Request
app.get('/', (req, res) => {
 
    // Sending the response
    res.send('Hello World!!!' + temp.toString())
    
    // Ending the response
    res.end()
})

app.post('/', (req, res) => {
  temp = req.body.temperature
  res.status(200).json({ message: "It worked!" });
});

// Establishing the port
const PORT = process.env.PORT ||5000;
 
// Executing the server on given port number
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));