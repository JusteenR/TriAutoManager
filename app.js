
// Importing express module
const express = require('express');
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const pool = require("./connection");
const listPatientRoutes = require("./routes/patientList");
const listComplaintRoutes = require("./routes/complaintList");
const listNurseRoutes = require("./routes/nurseList");

app.use(cors());
app.use(express.json());
app.use("/patientList",listPatientRoutes);
app.use("/complaintList",listComplaintRoutes);
app.use("/nurseList",listNurseRoutes);


var temp = 0
 
// Getting Request
app.get('/status', (req, res) => {
 
    // Sending the response
    res.send("1")
    
    // Ending the response
    res.end()
})

// Getting Request
app.get('/', (req, res) => {
 
  // Sending the response
  res.send('Hello World!!!' + temp.toString())
  
  // Ending the response
  res.end()
})

app.post('/vitals', (req, res) => {
  temp = req.body.temperature
  res.status(200).json({ message: "It worked!" });
});

// Establishing the port
const PORT = process.env.PORT || 8080;
 
// Executing the server on given port number
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));