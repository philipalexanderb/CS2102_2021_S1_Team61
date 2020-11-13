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

      res.render("apply_leave", {
        firstName: firstName,
        lastName: lastName,
        userName: username,
      });
    }
  });
});

router.post("/", function (req, res, next) {
  // console.log(req);
  var username = req.body.userName;
  console.log(username);
  var s_date = parse(req.body.startDate);
  console.log(s_date);
  var e_date = parse(req.body.endDate);
  console.log(e_date);
  pool.query(sql_query.query.apply_for_leave, [username, s_date,e_date], (err,data) => {
    if (err) {
      return next(err);
    }
  });
  // pool.query(sql_query.query.get_caretaker, [username], (err, data) => {
  //     if (err) {
  //         return next(err);
  //     } else {
  //         pool.query(sql_query.query.apply_for_leave, [
  //             username,
  //             s_date,
  //             e_date
  //           ]);
  //     }
  // });
  return res.redirect("/");
});

module.exports = router;
