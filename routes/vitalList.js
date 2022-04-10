const express = require("express");
const Router = express.Router();
const pool = require("../connection");
var status = 0
var frontEndSignal = 1
var ohip = null


// Gets data collection signal from front end, front end makes post request to this endpoint
Router.post('/collection', (req, res) => {
    status = 1;
});

// Gets data collection signal from MCU
Router.post('/beginCollection', (req, res) => {
  // Sets frontEndSignal to 1
  frontEndSignal = 1
});

// Allows user to submit vital sign info, front end makes get request to this endpoint
Router.get('/collectionReady', (req, res) => {
  res.send('1')
});


// Front end makes continuos get request to check if there is a start
Router.get('/beginCollectionFront', (req, res) => {
  if (frontEndSignal == 1) {
      // Good to go
      res.send('1')
  }
  else {
      //Wait
      res.send('0')
  }
});

// Gets temperature and blood oxygen from the MCU 
Router.post('/temperature', (req, res) => {
  const temperature = req.body.temperature

  connection.query(`UPDATE visitation_information AS v1, (SELECT visitid FROM visitation_information WHERE ohip = '${ohip}' ORDER BY visitid DESC LIMIT 1) AS v2
         SET PatientTemperature = '${temperature}' WHERE v1.visitid = v2.visitid`,(err,result)=> {
            if (err) {console.log(err);} 
            else {
                res.send('result')
                console.log("vital signs updated")
            }} );

  // Update the visit information with the given values
});

// Gets temperature and blood oxygen from the MCU 
Router.post('/oxygen', (req, res) => {
  const bloodOxygen = req.body.bloodOxygen

  connection.query(`UPDATE visitation_information AS v1, (SELECT visitid FROM visitation_information WHERE ohip = '${ohip}' ORDER BY visitid DESC LIMIT 1) AS v2
         SET PatientBloodOxygen = '${bloodOxygen}' WHERE v1.visitid = v2.visitid`,(err,result)=> {
            if (err) {console.log(err);} 
            else {
                res.send('result')
                console.log("vital signs updated")
            }} );

  // Update the visit information with the given values
});

Router.get("/vital/:ohip", (req, res) => {
    const OHIP =  req.params.ohip
    ohip = OHIP
    pool.getConnection(function(err, connection) {
      if (err) throw err; 
  
      connection.query(`SELECT PatientBloodPressure, PatientBloodOxygen, PatientHeartRate, PatientTemperature FROM visitation_information WHERE OHIP ='${OHIP}' ORDER BY visitid DESC LIMIT 1`, (err, rows, fields)=>{
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

  Router.post("/createvital",(req,res)=>{
    const OHIP = req.body.patientOhip
    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`INSERT INTO visitation_information (OHIP,PatientBloodPressure, PatientBloodOxygen, PatientHeartRate, PatientTemperature, PatientRiskLevel) VALUES ('${OHIP}',0,0,0,0,0)`,
        (err,result) => {if (err) {console.log(err);} else {res.send("Values Inserted into Visitation_information")}}
        );
      })
    });

  Router.put("/vitalUpdate",(req,res)=>{
    const OHIP = req.body.ohipNum
    const PatientBloodPressure = req.body.vitalSigns.PatientBloodPressureSys + ',' + req.body.vitalSigns.PatientBloodPressureDia; 
    const PatientHeartRate = req.body.vitalSigns.PatientHeartRate;

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`UPDATE visitation_information AS v1, (SELECT visitid FROM visitation_information WHERE ohip = '${OHIP}' ORDER BY visitid DESC LIMIT 1) AS v2
         SET PatientBloodPressure = '${PatientBloodPressure}', PatientHeartRate = '${PatientHeartRate}' WHERE v1.visitid = v2.visitid`,(err,result)=> {
            if (err) {console.log(err);} 
            else {
                res.send(result)
                console.log("vital signs updated")
            }} );
      })
});

Router.put("/riskLevelUpdate",(req,res)=>{
    const OHIP = req.body.OHIP
    const PatientRiskLevel = req.body.RiskLevel 

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`UPDATE visitation_information AS v1, (SELECT visitid FROM visitation_information WHERE ohip = '${OHIP}' ORDER BY visitid DESC LIMIT 1) AS v2
         SET PatientRiskLevel= '${PatientRiskLevel}' WHERE v1.visitid = v2.visitid)`,(err,result)=> {
            if (err) {console.log(err);} 
            else {
                res.send(result)
                console.log("risk Level updated")
            }} );
      })
});

// Status signals to send to the MCU
Router.post('/status', (req, res) => {
  const confirmation = req.body.confirmation
  if (confirmation) {
    status = status + 1
  }
 
  // Sending the response
  // Do nothing
  if (status == 0) {
      res.send('0')
  }
  // Begin collection 
  else if (status == 1) {
      res.send('1')
  }
  else if (status == 2) {
      res.send('2')
  }
  else if (status == 3) {
      res.send('3')
  }
  else if (status == 4) {
      res.send('4')
  }
  else if (status == 5) {
      res.send('5')
  }
  else if (status == 6) {
      res.send('6')
  }
  else if (status == 7) {
      res.send('7')
  }
  else if (status == 8) {
      res.send('8')
      // Set status back to zero
      status = 0
  }
  
  // Ending the response
  res.end()
})

/*
Router.get("/details/:patient", (req, res) => {
    var ohip = req.params.patient;
    var sql = "SELECT patient_profile.ohip AS ohip, firstname, lastname, patientsex, patientdob, PatientPhoneNumber, PatientAddress, PatientEmail, PatientHeight, PatientWeight, PatientAllergies, PatientMedication, PatientExistingConditions, PatientBloodPressure, PatientBloodOxygen, PatientHeartRate, PatientTemperature, PatientRiskLevel, approval, ChiefComplaint, PatientComplaint,PatientPainLevel, PatientSymptomList, arrivaldate FROM patient_profile JOIN visitation_information ON patient_profile.ohip = visitation_information.ohip JOIN patient_complaint ON patient_complaint.ohip = visitation_information.ohip HAVING ohip='"+ohip+"' ORDER BY visitid DESC LIMIT 1";
  
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
  
Router.post('/approval', (req, res) => {
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
    
  }); */

  module.exports=Router;
