var express = require("express");
var router = express.Router();
const sql_query = require("../sql");
const caretakerMiddleware = require("../auth/caremiddle");
const { Pool } = require("pg");

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Profile page
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

      res.render("caretakers", {
        firstName: firstName,
        lastName: lastName,
        userName: username,
        salary: salary,
      });
    }
  });
});

router.post("/", function (req, res, next) {
  console.log(req);
  var amount = req.body.amount;
  var pousername = req.body.pousername;
  var petname = req.body.petname;
  // Convert the date to the postgres date format
  var s_date = parse(req.body.startDate);
  console.log(s_date);
  var e_date = parse(req.body.endDate);
  console.log(e_date);
  var careTakerUsername = req.body.username;
  console.log("#########UserName##########");
  console.log(careTakerUsername);
  pool.query(sql_query.query.get_caretaker, [careTakerUsername], (err, data) => {
      if (err) {
          return next(err);
      } else {
          pool.query(sql_query.query.add_bid, [
              pousername,
              careTakerUsername,
              petname,
              s_date,
              e_date,
              amount,
            ]);
      }
  });
  return res.redirect("/petowners/" + pousername);
});

// Apply for leave
router.get("/:username/apply_for_leave", caretakerMiddleware(), async function (req, res, next) {
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

router.post("/:username/apply_for_leave", function (req, res, next) {
  // console.log(req);
  const username = req.params.username;
  console.log(username);
  var s_date = parse(req.body.startDate);
  console.log(s_date);
  var e_date = parse(req.body.endDate);
  console.log(e_date);
  pool.query(sql_query.query.get_caretaker, [careTakerUsername], (err, data) => {
      if (err) {
          return next(err);
      } else {
          pool.query(sql_query.query.apply_for_leave, [
              username,
              s_date,
              e_date
            ]);
      }
  });
  return res.redirect("/caretakers/" + pousername);
});




module.exports = router;
