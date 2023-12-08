//requiring the modules needed
const express = require("express");
const shortid = require("shortid"); //for ceating a unique code for given url
const db = require('./models');

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));  //middleware to parse the incoming data from html form

//get request from server to client
app.get("/", (req, res) => {
    res.render("home.ejs");
});

//get all url api

app.get('/api/allurl', (req, res) => {
    db.query('SELECT * FROM `url`', (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

//post request from client to the server
app.post("/shorturl", (req, res) => {
    const fullUrl = req.body.fullUrl;
    const customShortcode = req.body.customShortcode;   //for custom shortcode from client
    
    //console.log(fullUrl)
    if (!fullUrl) {
        return res.sendStatus(404);
    }

    db.query('SELECT * FROM `url` WHERE `fullUrl` = ?', [fullUrl], (error, results) => {
        if (error) {
            console.error("Error querying the database:", error);
            return res.sendStatus(500);
        }
            // console.log(results)
        if (results.length === 0) {
            const short = customShortcode || shortid.generate();
            const url = { fullUrl: req.body.fullUrl, shortUrl: short, counts: 1 };

            db.query('INSERT INTO `url` SET ?', url, (err, insertResult) => {
                if (err) {
                    console.error("Error inserting into the database:", err);
                    return res.sendStatus(500);
                }

                // if (insertResult.affectedRows === 0) {
                //     console.log("Duplicate entry attempted");
                //     return res.sendStatus(409); // Conflict status for duplicate entry
                // }

                res.render("result.ejs", { shortUrl: short, times: 1 });
            });
        } else {
            const _short = results[0].shortUrl;
            const _counts = results[0].counts;

            db.query('UPDATE `url` SET `counts` = ? WHERE `shortUrl` = ?', [_counts + 1, _short], (err, updateResult) => {
                if (err) {
                    console.error("Error updating the database:", err);
                    return res.sendStatus(500);
                }
                res.render("result.ejs", { shortUrl: _short, times: _counts + 1 });
            });
        }
    });
});

// get request for full url display when provided with shortcode 

app.get('/geturl/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;

    db.query('SELECT * FROM `url` WHERE `shortUrl` = ?', [shortCode], (error, results) => {
        if (error) {
            console.error("Error querying the database:", error);
            return res.sendStatus(500);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Short code not found' });
        }

        const fullUrl = results[0].fullUrl;
        res.json({ fullUrl });
    });
});

//direct to main url from shortcode
app.get("/:shortUrl", (req, res) => {
    db.query('SELECT * FROM `url` WHERE `shortUrl` = ?', [req.params.shortUrl], (error, results) => {
        if (error) {
            return res.sendStatus(404);
        }

        if (results.length === 0) {
            res.render("error.ejs");
        } else {
            res.redirect(results[0].fullUrl);
        }
    });
});

//app listening to server
app.listen(3000,()=>{
    console.log("Connected.")
});

