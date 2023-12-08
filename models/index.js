//Connecting to our mysql database

const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "url_shortener"        //database name in phpmyAdmin through Xampp
});

db.connect(err => {
    if(err) {
        console.log("Error connecting to DB");
        return;
    }
    console.log("Connceted to DB");
});

module.exports = db;                   //exporting db variable