const express = require("express");
const Router = express.Router();
const pool = require("../connection");

// Allows to read database
Router.get("/:ohip",(req,res)=>{
    const OHIP =  req.params.ohip
    console.log(OHIP)

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`select * from patient_profile WHERE OHIP ='${OHIP}'`, (err, rows, fields)=>{
            if (!err){ res.send(rows); console.log(rows)}
            else { console.log(err); }
        })
      })
});

Router.get("/riskcalculateDOB/:ohip",(req,res)=>{
    const OHIP =  req.params.ohip

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`select FLOOR((TO_DAYS(DATE(NOW())) - TO_DAYS(patientDOB))/365.25) AS Age from patient_profile WHERE OHIP ='${OHIP}'`, (err, rows, fields)=>{
            if (!err){ res.send(rows); console.log(rows)}
            else { console.log(err); }
        })
      })
});

//adds to database
Router.post("/create",(req,res)=>{
    const OHIP = req.body.patientProfile.OHIP
    const FirstName= req.body.patientProfile.FirstName
    const LastName= req.body.patientProfile.LastName
    const PatientSex= req.body.patientProfile.PatientSex
    const patientDOB= req.body.patientProfile.patientDOB
    const PatientPhoneNumber= req.body.patientProfile.PatientPhoneNumber
    const PatientEmail= req.body.patientProfile.PatientEmail
    const PatientAddress= req.body.patientProfile.PatientAddress
    const PatientHeight= req.body.patientProfile.PatientHeight
    const PatientWeight= req.body.patientProfile.PatientWeight
    const PatientAllergies= req.body.patientProfile.PatientAllergies
    const PatientMedication= req.body.patientProfile.PatientMedication
    const PatientExistingConditions= req.body.patientProfile.PatientExistingConditions

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query("INSERT INTO patient_profile (OHIP,FirstName, LastName, PatientSex,patientDOB, PatientPhoneNumber, PatientAddress, PatientEmail, PatientHeight, PatientWeight, PatientAllergies, PatientMedication, PatientExistingConditions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [OHIP,FirstName,LastName,PatientSex,patientDOB,PatientPhoneNumber,PatientAddress,PatientEmail,PatientHeight,PatientWeight,PatientAllergies,PatientMedication,PatientExistingConditions],
        (err,result) => {if (err) {console.log(err);} else {res.send("Values Inserted")}}
        );
      })
});

//updates database
Router.put("/update",(req,res)=>{
    const OHIP = req.body.patientProfile.OHIP
    const FirstName= req.body.patientProfile.FirstName
    const LastName= req.body.patientProfile.LastName
    const PatientSex= req.body.patientProfile.PatientSex
    const patientDOB= req.body.patientProfile.patientDOB
    const PatientPhoneNumber= req.body.patientProfile.PatientPhoneNumber
    const PatientEmail= req.body.patientProfile.PatientEmail
    const PatientAddress= req.body.patientProfile.PatientAddress
    const PatientHeight= req.body.patientProfile.PatientHeight
    const PatientWeight= req.body.patientProfile.PatientWeight
    const PatientAllergies= req.body.patientProfile.PatientAllergies
    const PatientMedication= req.body.patientProfile.PatientMedication
    const PatientExistingConditions= req.body.patientProfile.PatientExistingConditions

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query("UPDATE patient_profile SET OHIP = ?, FirstName = ?, LastName= ?, PatientSex=?, patientDOB = ?, PatientPhoneNumber = ? , PatientAddress = ?, PatientEmail = ?, PatientHeight = ? , PatientWeight = ?, PatientAllergies = ? , PatientMedication = ?, PatientExistingConditions = ? WHERE OHIP = ? ",[OHIP,FirstName, LastName, PatientSex,patientDOB, PatientPhoneNumber, PatientAddress, PatientEmail, PatientHeight, PatientWeight, PatientAllergies, PatientMedication, PatientExistingConditions,OHIP],(err,result)=> {if (err) {console.log(err);} else {res.send(result)}} );
      })
}); 

//deletes items in database
Router.delete('/delete/:id',(req,res)=>{
    const id = req.params.id

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query("DELETE FROM patient_database WHERE id = ? ",id,(err,result)=> {if (err) {console.log(err);} else {res.send(result)}} );
      })
}); 

module.exports=Router;