var express = require("express");
var router = express.Router();
const sql_query = require("../sql");

const { Pool } = require("pg");
const { middleware } = require("../auth");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get("/", middleware(), function (req, res, next) {
  const username = req.session.passport.user;

  // var pets = [];
  // pool.query(sql_query.query.get_pets, [username], (err, data) => {
  //   pets = data.rows;
  //   console.log(data.rows);
  // });

  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  pool.query(sql_query.query.browse, [], (err, data) => {
    var username = req.session.passport.user;
    // console.log(username);

    // to offset ISO string convention timezone
    for (var i = 0; i < data.rows.length; i++) {
      data.rows[i].s_date = (new Date(data.rows[i].s_date - tzoffset))
      data.rows[i].e_date = (new Date(data.rows[i].e_date - tzoffset))
      // console.log(data.rows[i].s_date);
    }
    // console.log(data.rows);

    // res.render("browse", { avails: data.rows, username: username, pets: pets });
    res.render("browse", { avails: data.rows, username: username });
  });
});

router.get("/:id", function (req, res, next) {
  const username = req.params.id;
  const pousername = req.session.passport.user;

  // get bids for a caretaker
  pool.query(sql_query.query.get_bid, [username], (err, bids_res) => {
    // get other data for caretaker
    pool.query(sql_query.query.get_browsed_caretaker, [req.params.id], (err, data) => {

      pool.query(sql_query.query.get_review, [req.params.id], (err, data1) => {

        // convert timezone
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        for (var i = 0; i < bids_res.rows.length; i++) {
          bids_res.rows[i].s_date = (new Date(bids_res.rows[i].s_date - tzoffset))
          bids_res.rows[i].e_date = (new Date(bids_res.rows[i].e_date - tzoffset))
        }
  
        console.log(bids_res.rows);
        console.log("##################### REVIEW HERE #####################");
        console.log(data1.rows);
        res.render("browsed_caretaker", {
          username: data.rows[0].username,
          pousername: pousername,
          address: data.rows[0].address,
          first_name: data.rows[0].first_name,
          last_name: data.rows[0].last_name,
          bids: bids_res.rows,
          reviews: data1.rows
        })

      });
    });
  });
});

module.exports = router;
