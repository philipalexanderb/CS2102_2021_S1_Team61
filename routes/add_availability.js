const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const sql_query = require("../sql");
const parse = require('postgres-date');
const caretakerMiddleware = require("../auth/caremiddle");

const { Pool } = require("pg");

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});



// Apply for leave
router.get("/:username", caretakerMiddleware(), async function (req, res, next) {
  const username = req.params.username;
  var caretakers = await pool.query(sql_query.query.get_caretaker, [username]);
  pool.query(sql_query.query.get_user, [username], (err, data) => {
    if (err) {
      res.render("error", err);
    } else if (data.rows.length == 0) {
      res.send("User does not exist");
    } else {
      const firstName = data.rows[0].first_name;
      const lastName = data.rows[0].last_name;
      const salary = caretakers.rows[0].salary;

      res.render("add_availability", {
        firstName: firstName,
        lastName: lastName,
        userName: username,
      });
    }
  });
});

router.post("/", function (req, res, next) {
  // console.log(req);
  console.log('add avail')
  var username = req.body.userName;
  console.log(username);
  var s_date = parse(req.body.startDate);
  var e_date = parse(req.body.endDate);
  var s_date_str = req.body.startDate;
  console.log(s_date_str);
  var e_date_str = req.body.endDate;

  var e_date_parts = e_date_str.split('-');
  var e_date = new Date(e_date_parts[0], e_date_parts[1] - 1, e_date_parts[2]);

  if (s_date_str < e_date_str) {
    console.log('less');
    var s_date_parts = s_date_str.split('-');
    var s_date = new Date(s_date_parts[0], s_date_parts[1] - 1, s_date_parts[2]);
    while (s_date_str !== e_date_str) { // 2020-10-20
      var s_date_parts = s_date_str.split('-');
      var s_date = new Date(s_date_parts[0], s_date_parts[1] - 1, s_date_parts[2]);
      // console.log(s_date_str);
      pool.query(sql_query.query.add_availability, [username, s_date_str], (err, data) => {
        if (err) {
          return next(err);
        }
      });
      console.log(s_date);
      s_date.setDate(s_date.getDate() + 2);
      console.log(s_date);
      // var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
      //   for (var i = 0; i < bids_res.rows.length; i++) {
      //     bids_res.rows[i].s_date = new Date(
      //       bids_res.rows[i].s_date - tzoffset
      //     );
      //     bids_res.rows[i].e_date = new Date(
      //       bids_res.rows[i].e_date - tzoffset
      //     );
      //   }
      s_date_str = s_date.toISOString().substring(0, 10)
      console.log(s_date_str);
    }
    pool.query(sql_query.query.add_availability, [username, s_date_str], (err, data) => {
      if (err) {
        return next(err);
      }
    });
  } else if (s_date_str == e_date_str) {
    console.log('eh');
    var parts = s_date_str.split('-');
    console.log(parts);
    pool.query(sql_query.query.add_availability, [username, s_date_str], (err, data) => {
      if (err) {
        console.log(err);
        return next(err);
      }
    });
  } else {
    console.log('else')
  }


  return res.redirect("/");
});

module.exports = router;
