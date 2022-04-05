const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../connection");

// Allows to read database
Router.get("/",(req,res)=>{

    mysqlConnection.query("select * from  patient_database", (err, rows, fields)=>{
        if (!err){ res.send(rows);}
        else { console.log(err); }
    })
});

//adds to database
Router.post("/create",(req,res)=>{
    const firstname = req.body.items.firstname
    const lastname = req.body.items.lastname
    const age = req.body.items.age
    const risklevel = req.body.items.risklevel
    mysqlConnection.query("INSERT INTO patient_database (firstname, lastname, age,risklevel) VALUES (?,?,?,?)",
                        [firstname,lastname,age,risklevel],
                        (err,result) => {if (err) {console.log(err);} else {res.send("Values Inserted")}}
                        );
});

//updates database
Router.put("/update",(req,res)=>{
    const id = req.body.id
    const firstname = req.body.items.firstname
    const lastname = req.body.items.lastname
    const age = req.body.items.age
    const risklevel = req.body.items.risklevel
    mysqlConnection.query("UPDATE patient_database SET firstname = ?, lastname= ?, age=?, risklevel= ? WHERE id =? ",[firstname,lastname,age,risklevel,id],(err,result)=> {if (err) {console.log(err);} else {res.send(result)}} ); 

}); 

//deletes items in database
Router.delete('/delete/:id',(req,res)=>{
    const id = req.params.id
    mysqlConnection.query("DELETE FROM patient_database WHERE id = ? ",id,(err,result)=> {if (err) {console.log(err);} else {res.send(result)}} ); 

}); 



module.exports=Router;