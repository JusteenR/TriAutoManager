const express = require("express");
const Router = express.Router();
const pool = require("../connection");
var status = 1
var frontEndSignal = 0
var ohip = null
var collectionReady = 0



// Gets data collection signal from front end, front end makes post request to this endpoint
Router.post('/collection', (req, res) => {
    status = 1;
});

// Gets data collection signal from MCU
Router.post('/beginCollection', (req, res) => {
  // Tells front end to display collecting vital sign page but for not allow them to click submit
  res.send(frontEndSignal)
});

// Allows user to submit vital sign info, front end makes get request to this endpoint
Router.get('/collectionReady', (req, res) => {
  if (collectionReady == 1){
    res.send('1');
    collectionReady = 0
  } else if (collectionReady == 2){
    res.send('2');
    collectionReady = 0
  } else if (collectionReady == 3){
    res.send('3');
    collectionReady = 0
  }
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
Router.post('/vitals', (req, res) => {
  const temperature = req.body.temperature
  const bloodOxygen = req.body.bloodOxygen

  connection.query(`UPDATE visitation_information AS v1, (SELECT visitid FROM visitation_information WHERE ohip = '${ohip}' ORDER BY visitid DESC LIMIT 1) AS v2
         SET PatientTemperature = '${temperature}', PatientBloodOxygen = '${bloodOxygen}' WHERE v1.visitid = v2.visitid`,(err,result)=> {
            if (err) {console.log(err);} 
            else {
                res.send('result')
                console.log("vital signs updated")
            }} );

  // Tell front end the submit value is now clickable
  collectionReady = 1
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

// Embedded to backend
Router.post('/status', (req, res) => {

  let es_response = req.body.es_response
  es_response = JSON.stringify(es_response)

  if (status == 1){
    // Start data collection
    if (es_response == 0){
      frontEndSignal = 1
      res.send('1')
    } else if (es_response == 1){
      // Start frontend data collection screen but not allow user to click submit
      collectionReady = 1
    } else if (es_response == 2){
      // Help signal
      collectionReady = 2
      res.send('2')
      status = 0 
    } else if (es_response == 3){
      // Send signal to the nurse interface there is an error
      collectionReady = 3
      status = 0 
    }
  }

  
  // Ending the response
  res.end()
})


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

// Embedded to backend
Router.get('/statusESP/:esp_response', (req, res) => {

let esp_response = req.params.esp_response
esp_response = JSON.stringify(esp_response)

if (status == 1){
  // Start data collection
  if (esp_response == 0){
    frontEndSignal = 1
    res.send('1')
  } else if (esp_response == 1){
    // Start frontend data collection screen but not allow user to click submit
    collectionReady = 1
  } else if (esp_response == 2){
    // Help signal
    collectionReady = 2
    status = 1
    res.send('2')
    //status = 0 
  } else if (esp_response == 3){
    // Send signal to the nurse interface there is an error
    collectionReady = 3
    status = 1
    //status = 0 
    res.send('3')
  }
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
