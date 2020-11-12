var express = require("express");
var router = express.Router();
const sql_query = require("../sql");
const caretakerMiddleware = require("../auth/caremiddle");
const { Pool } = require("pg");
const parse = require('postgres-date')

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Profile page
router.get("/:username", caretakerMiddleware(), async function (req, res, next) {
  const username = req.params.username;

  var bids = [];
  pool.query(sql_query.query.get_bid, [username], (err, data) => {
    bids = data.rows;
  });

  console.log(bids);

  setTimeout(() => {
    pool.query(sql_query.query.get_user, [username], (err, data) => {
      if (err) {
        res.render("error", err);
      } else if (data.rows.length == 0) {
        res.send("User does not exist");
      } else {
        const firstName = data.rows[0].first_name;
        const lastName = data.rows[0].last_name;
        const salary = data.rows[0].salary;

        res.render("caretakers", {
          firstName: firstName,
          lastName: lastName,
          userName: username,
          salary: salary,
          bids: bids,
        });
      }
    });
  }, 2000); 

});

// Accept bid
router.get("/:username/accept/:s_date/:e_date/:pouname/:name/:price", caretakerMiddleware(), async function (req, res, next) {
  const username = req.params.username;
  var s_date = parse(req.params.s_date);
  console.log(req.params.s_date);
  console.log(s_date);
  var e_date = parse(req.params.e_date);
  console.log(e_date);
  const pouname = req.params.pouname;
  const name = req.params.name;
  const price = req.params.price;

  pool.query(sql_query.query.get_caretaker, [username], (err, data) => {
    if (err) {
        return next(err);
    } else {
        pool.query(sql_query.query.add_bid_date, [
            s_date,
            e_date,
          ]);
    }
  });

  pool.query(sql_query.query.get_caretaker, [username], (err, data) => {
    if (err) {
        return next(err);
    } else { 
        pool.query(sql_query.query.update_bid, [
            pouname,
            username,
            name,
            s_date,
            e_date,
            price,
          ]);
    }
  });

  return res.redirect("/caretakers/" + username);

});

module.exports = router;
