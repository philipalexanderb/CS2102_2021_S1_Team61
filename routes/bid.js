const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const sql_query = require("../sql");
const parse = require('postgres-date')
const { Pool } = require("pg");

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Bid
router.get("/", function (req, res, next) {
    console.log("##############################################Username here#######################################");
    console.log(req.user.username);
    console.log(req);
    res.render("bid", {username: req.user.username});
});

// Review Bid
router.get("/review/:first_name/:last_name/:s_date/:e_date/:name/:ctuname", function (req, res, next) {
  console.log("##############################################Username here#######################################");
  console.log(req.user.username);
  console.log(req);

  var ctfirst_name = req.params.first_name;
  var ctlast_name = req.params.last_name;
  
  var s_date = req.params.s_date;
  var e_date = req.params.e_date;
  
  var name = req.params.name;
  var ctuname = req.params.ctuname;

  res.render("review", {username: req.user.username, fn: ctfirst_name, ln: ctlast_name, s_date: s_date, e_date: e_date, name: name, ctuname: ctuname});
});

router.post("/review", function (req, res, next) {

  var rating = req.body.rating;
  var review = req.body.review;
  console.log(rating);
  console.log(review);
  var pouname = req.user.username;
  var s_date = parse(req.body.s_date);
  var e_date = parse(req.body.e_date);
  var ctuname = req.body.ctuname;
  var name = req.body.name;

  //rating=$6, review=$7 WHERE bids.pouname=$1 AND bids.ctuname=$2 AND bids.name=$3 AND bids.s_date=$4 AND bids.e_date=$5"
  pool.query(sql_query.query.add_review, [pouname, ctuname, name, s_date, e_date, rating, review], (err, data) => {
    if (err) {
        return next(err);
    } else {
        pool.query(sql_query.query.add_bid_date, [
            s_date,
            e_date,
          ]);
    }
  });

  res.redirect("/petowners/" + req.user.username);
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
    console.log("#########Caretaker UserName##########");
    console.log(careTakerUsername);
    console.log("#########Pet Owener UserName##########");
    console.log(pousername);
    pool.query(sql_query.query.get_caretaker, [careTakerUsername], (err, data) => {
      if (err) {
          return next(err);
      } else {
          pool.query(sql_query.query.add_bid_date, [
              s_date,
              e_date,
            ]);
      }
    });
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
    return res.redirect("/browse/" + careTakerUsername);
  });

module.exports = router;
