const express = require("express");
const Router = express.Router();
const pool = require("../connection");
var status = '1'
var frontEndSignal = '0'
var ohip = null
var collectionReady = '0'



// Gets data collection signal from front end, front end makes post request to this endpoint
Router.post('/collection', (req, res) => {
    status = '1';
});

// Gets data collection signal from MCU
Router.post('/beginCollection', (req, res) => {
  // Tells front end to display collecting vital sign page but for not allow them to click submit
  res.send(frontEndSignal)
});

// Allows user to submit vital sign info, front end makes get request to this endpoint
Router.get('/collectionReady', (req, res) => {
  res.send(collectionReady)
  }
);



// Front end makes continuos get request to check if there is a start
Router.get('/beginCollectionFront', (req, res) => {
  res.send(frontEndSignal)
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

Router.get('/status/:es_response', (req, res) => {
  console.log('Received poll from embedded\n')
  console.log('Sent status: ')
  console.log(status)
  res.send(status)
})


Router.post('/status', (req, res) => {
  console.log('Received signal from embedded: ')
  let es_response = req.body.es_response
  console.log(es_response)

  res.send('1')

  if(es_response == '0'){} //do nothing

  else if(es_response == '1') //confirmation
  {
    //sent begin collection
    if(status=='1')
    {
      /* Update Frontend: 
      Display "Running measurement routine"
      Display "When complete, enter blood pressure and heart rate values from screen."
      Display input fields for blood pressure & hr
      */
    }

    //sent measure blood pressure
    if(status=='2'){
      /* Update Frontend:
      Display "When complete, enter blood pressure values from screen."
      Display input fields for blood pressure
      */
    }

    //sent measure heart rate
    if(status=='3'){
      /* Update Frontend:
      Display "When complete, enter heart rate values from screen."
      Display input fields for hr
      */
    }

    //sent measure blood oxygen
    if(status=='4'){
      /* Update Frontend:
      Display "Waiting"
      Update again when blood oxygen is updated via post to vitals
      */
    }

    //sent measure temperature
    if(status=='5'){
      /* Update Frontend:
      Display "Waiting"
      Update again when temperature is updated via post to vitals
      */
    }

    //sent view blood pressure
    if(status=='6'){
   
    }

    //sent status check
    if(status=='7'){

    }

    //sent collection complete
    if(status=='8'){
      /* Update Frontend:
      Patient triaged!
      */
    }

    status = '0' //action confirmed, reset status variable
  }

  else if(es_response == '2') //help pressed
  {
    //Send help signal to nurse station
    //Update frontend
  }

  else if(es_response == '3') //error
  {
    //Report error to frontend
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

  // Sends MCU message that the vital signs are added to the database
  status = '8'
  // Tell front end the submit value is now clickable
  collectionReady = '1'
});


/*
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

*/

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

// Testing endpoint not truly used
// Embedded to backend
Router.get('/statusESP/:esp_response', (req, res) => {

  let esp_response = req.params.esp_response
  //esp_response = JSON.stringify(esp_response)
  console.log(esp_response==="1")

  if (status == '1'){
    // Start data collection
    if (esp_response === "0"){
      frontEndSignal = 1
      res.send('0')
    } else if (esp_response === "1"){
      // Start frontend data collection screen but not allow user to click submit
      collectionReady = 1
      res.send('1')
    } else if (esp_response === "2"){
      // Help signal
      collectionReady = 2
      status = 1
      res.send('2')
      //status = 0 
    } else if (esp_response === "3"){
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
