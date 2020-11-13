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
router.get("/:username", caretakerMiddleware(), function (req, res, next) {
  const username = req.params.username;

  pool.query(sql_query.query.get_bid, [username], (err, bids_res) => {

    pool.query(sql_query.query.get_user, [username], (err, data) => {
      if (err) {
        res.render("error", err);
      } else if (data.rows.length == 0) {
        res.send("User does not exist");
      } else {
        const firstName = data.rows[0].first_name;
        const lastName = data.rows[0].last_name;
        const salary = data.rows[0].salary;

        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        for (var i = 0; i < bids_res.rows.length; i++) {
          bids_res.rows[i].s_date = (new Date(bids_res.rows[i].s_date - tzoffset))
          bids_res.rows[i].e_date = (new Date(bids_res.rows[i].e_date - tzoffset))
        }

        res.render("caretakers", {
          firstName: firstName,
          lastName: lastName,
          userName: username,
          salary: salary,
          bids: bids_res.rows,
        });
      }
    });

  });
});

// Accept bid
router.get("/:username/accept/:s_date/:e_date/:pouname/:name/:price", caretakerMiddleware(), function (req, res, next) {

  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

  const username = req.params.username;
  var s_date = req.params.s_date;
  var e_date = req.params.e_date;
  // var s_date = parse(req.params.s_date) + tzoffset;
  // console.log(req.params.s_date);
  // console.log(s_date);
  // var e_date = parse(req.params.e_date) + tzoffset;
  // console.log(e_date);
  const pouname = req.params.pouname;
  const name = req.params.name;
  const price = req.params.price;

  // s_date = (new Date(new Date(s_date) + tzoffset));
  // console.log(s_date);
  // e_date = (new Date(new Date(e_date + tzoffset));

  // pool.query(sql_query.query.get_caretaker, [username], (err, data) => {
  //   if (err) {
  //     return next(err);
  //   } else {
  //     pool.query(sql_query.query.add_bid_date, [s_date, e_date]);
  //   }
  // });

  console.log('reach here')

  // pool.query(sql_query.query.add_bid_date, [s_date, e_date]);
  pool.query(sql_query.query.update_bid, [pouname, username, name, s_date, e_date, price], (err, res) => {
    if (err) {
      //console.log([pouname, username, name, s_date, e_date, price]);
      //console.log('error gajelas');
      console.log(err);
    } else {
      console.log(res);
    }
  });

  // pool.query(sql_query.query.get_caretaker, [username], (err, data) => {
  //   if (err) {
  //     return next(err);
  //   } else {
  //     pool.query(sql_query.query.update_bid, [
  //       pouname,
  //       username,
  //       name,
  //       s_date,
  //       e_date,
  //       price,
  //     ]);
  //   }
  // });

  return res.redirect("/caretakers/" + username);

});

module.exports = router;
