var express = require("express");
var router = express.Router();
const sql_query = require("../sql");
const petMiddleware = require("../auth/petmiddle");
const { Pool } = require("pg");

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Profile page
router.get("/:username", petMiddleware(), function (req, res, next) {
  const username = req.params.username;

  var pets = [];
  pool.query(sql_query.query.get_pets, [username], (err, data) => {
    pets = data.rows;
  });

  console.log((new Date()));
  console.log("############################## PETS HERE #################################");
  console.log(pets);
  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  var curr_date = new Date(Date.now() - tzoffset);
  // console.log("####################### DATE HERE #########################");
  // console.log(curr_date);
  // console.log(new Date());

  pool.query(sql_query.query.get_user, [username], (err, data) => {
    
    var successful_bids = [];

    pool.query(sql_query.query.get_successful_bid, [username], (err1, data1) => {
      successful_bids = data1.rows;
      console.log(successful_bids);

      // convert timezone
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      for (var i = 0; i < successful_bids.length; i++) {
        successful_bids[i].s_date = (new Date(successful_bids[i].s_date - tzoffset))
        successful_bids[i].e_date = (new Date(successful_bids[i].e_date - tzoffset))
      }
    
      if (err) {
        res.next(err);
      } else if (data.rows.length == 0) {
        res.send("User does not exist");
      } else {
        const firstName = data.rows[0].first_name;
        const lastName = data.rows[0].last_name;
        res.render("petowners",
          {
            firstName: firstName,
            lastName: lastName,
            username: username,
            pets: pets,
            successful_bids: successful_bids,
            curr_date: curr_date
          });
      }
    });

  });

});

module.exports = router;
