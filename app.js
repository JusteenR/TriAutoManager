
// Importing express module
const express = require('express');
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const pool = require("./connection");
const listPatientRoutes = require("./routes/patientList");
const listComplaintRoutes = require("./routes/complaintList");

app.use(cors());
app.use(express.json());
app.use("/patientList",listPatientRoutes);
app.use("/complaintList",listComplaintRoutes);


var temp = 0
 
// Getting Request
app.get('/status', (req, res) => {
 
    // Sending the response
    res.send("1")
    
    // Ending the response
    res.end()
})

app.get("/visitation", (req, res) => {
  pool.getConnection(function(err, connection) {
    if (err) throw err; 

    connection.query("SELECT triagestation, firstname, lastname, ohip, vid, approval FROM patient_profile JOIN (SELECT max(VisitID) as vid, ohip, triagestation, approval FROM visitation_information WHERE approval='False' GROUP BY(ohip))v2 USING (ohip);", (err, rows, fields)=>{
      if (!err){ 
        res.send(rows);
        connection.release();
      }
      else { 
        console.log(err); 
      }
    })
  });
});

app.get("/details/:patient", (req, res) => {
  var ohip = req.params.patient;
  var sql = "SELECT patient_profile.ohip AS ohip, firstname, lastname, patientsex, patientdob, PatientPhoneNumber, PatientAddress, PatientEmail, PatientHeight, PatientWeight, PatientAllergies, PatientMedication, PatientExistingConditions, PatientBloodPressure, PatientBloodOxygen, PatientHeartRate, PatientTemperature, PatientRiskLevel, approval, ChiefComplaint, PatientComplaint,PatientPainLevel, PatientSymptomList, arrivaldate FROM patient_profile JOIN visitation_information ON patient_profile.ohip = visitation_information.ohip JOIN patient_complaint ON patient_complaint.ohip = visitation_information.ohip HAVING ohip='"+ohip+"' ORDER BY arrivaldate DESC LIMIT 1";

  pool.getConnection(function(err, connection){
    if (err) throw err;

    connection.query(sql, (err, rows, fields)=>{
      if (!err){
         res.send(rows);
         connection.release();
        }
      else { 
        console.log(err); 
      }
    })
  })
});

app.post('/approval', (req, res) => {
  let approvedRisk = req.body.risk;
  let ohip = req.body.ohip;
  let sql = "UPDATE visitation_information SET approval='True', patientrisklevel='" + approvedRisk + "' WHERE ohip='" + ohip + "' ORDER BY visitid DESC LIMIT 1;"
  
  pool.getConnection(function(err, connection){
    if (err) throw err;

    connection.query(sql, (err, rows, fields)=>{
      if (!err){
         res.send(rows);
         connection.release();
        }
      else { 
        console.log(err); 
      }
    })
  })
  
});

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