const mysql = require("mysql");

//Allows connection to the sql database deployed through Heroku. 

/** Section below expose secrets, indicating private information regarding database for developers only. In real world application */
/** Database information would not be leaked and would go through numerous security protocols to establish proper information hiding.  **/
var mysqlConnection = mysql.createConnection({
    host: "us-cdbr-east-05.cleardb.net",
    user : "b7498e9daf3e28" ,
    password: "30433a5c",
    database: "heroku_2a149538abd113b",
    multipleStatements: true
});

db_config = {
    host: "us-cdbr-east-05.cleardb.net",
    user : "b7498e9daf3e28" ,
    password: "30433a5c",
    database: "heroku_2a149538abd113b",
    multipleStatements: true
}

mysqlConnection.connect((err) => {
    if(!err)
    {
        console.log("Connected");
    }
    else 
    {
        console.log(err);
        console.log("Connection Failed");
    }

    function handleDisconnect() {
        connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                        // the old one cannot be reused.
      
        connection.connect(function(err) {              // The server is either down
          if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
          }                                     // to avoid a hot loop, and to allow our node script to
        });                                     // process asynchronous requests in the meantime.
                                                // If you're also serving http, display a 503 error.
        connection.on('error', function(err) {
          console.log('db error', err);
          if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
          } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
          }
        });
      }
      
      handleDisconnect();

})

module.exports = mysqlConnection;

//mysql://b7498e9daf3e28:30433a5c@us-cdbr-east-05.cleardb.net/heroku_2a149538abd113b?reconnect=true