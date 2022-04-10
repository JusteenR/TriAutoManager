const express = require("express");
const Router = express.Router();
const pool = require("../connection");

// Allows to read database
Router.get("/:ohip",(req,res)=>{
    const OHIP =  req.params.ohip
    console.log("complaint section")
    console.log(OHIP)


    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query(`select * from  patient_complaint WHERE OHIP ='${OHIP}'`, (err, rows, fields)=>{
            if (!err){ res.send(rows);
                console.log(rows);
                console.log("Complaint Updated")
                ;}
            else { console.log(err); }
        })
      })
});
/// gets ctas and cedis levels 
Router.get("/riskcalculateCEDISCTAS/:ohip",(req,res)=>{
    const OHIP =  req.params.ohip
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(`select PatientComplaint, PatientCtasLevel from  patient_complaint WHERE OHIP ='${OHIP}'`, (err, rows, fields)=>{
            if (!err){ res.send(rows);
                console.log(rows)
                ;}
            else { console.log(err); }
        })
      })
});

//adds to database
Router.post("/create",(req,res)=>{
    const OHIP = req.body.patientComplaint.OHIP
    const VisitID= req.body.patientComplaint.VisitID
    const PatientComplaint= req.body.patientComplaint.PatientComplaint
    const PatientCtasLevel = req.body.patientComplaint.PatientCtasLevel
    const ComplaintEvent= req.body.patientComplaint.ComplaintEvent
    const PatientPainLevel= req.body.patientComplaint.PatientPainLevel
    const PatientSymptomList= req.body.patientComplaint.PatientSymptomList
    const PatientComments= req.body.patientComplaint.PatientComments


    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query("INSERT INTO patient_complaint(OHIP,VisitID, PatientComplaint, PatientCtasLevel, ComplaintEvent, PatientPainLevel, PatientSymptomList, PatientComments) VALUES (?,?,?,?,?,?,?,?)",
        [OHIP,VisitID, PatientComplaint, PatientCtasLevel, ComplaintEvent, PatientPainLevel, PatientSymptomList, PatientComments],
        (err,result) => {if (err) {console.log(err);} else {console.log("Values Inserted")}}
        );
      })
});


//deletes items in database
Router.delete('/delete/:id',(req,res)=>{
    const id = req.params.id

    pool.getConnection(function(err, connection){
        if (err) throw err;
    
        connection.query("DELETE FROM patient_complaint WHERE ComplaintId = ? ",id,(err,result)=> {if (err) {console.log(err);} else {console.log("values deleted")}} );
      })

}); 

module.exports=Router;