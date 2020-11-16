var express = require("express");
var router = express.Router();
const sql_query = require("../sql");
const caretakerMiddleware = require("../auth/caremiddle");
const { Pool } = require("pg");
const parse = require("postgres-date");


// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Profile page
router.get("/:username", caretakerMiddleware(), function (req, res, next) {
  const username = req.params.username;

  var avails = [];
  pool.query(sql_query.query.get_availability, [username], (err, data) => {
    console.log(data.rows);
    avails = data.rows;
  });

  var rating = "No rating yet."
  pool.query(sql_query.query.get_rating, [username], (err, data) => {
    // console.log(data.rows[0].avg);
    if (data.rows != null) {
      rating = Math.round(data.rows[0].avg, 1);
    }
  });

  var pet_days = 0;
  pool.query(sql_query.query.get_num_of_pet_days, [username], (err, data) => {
    // console.log(data.rows[0].num_days);
    if (data.rows != null) {
      pet_days = data.rows[0].num_days;
    }
  });

  
  pool.query(sql_query.query.get_review, [username], (err, data1) => {
    pool.query(sql_query.query.get_bid, [username], (err, bids_res) => {
      pool.query(sql_query.query.get_user, [username], (err, data) => {
        if (err) {
          res.render("error", err);
        } else if (data.rows.length == 0) {
          res.send("User does not exist");
        } else {
          const firstName = data.rows[0].first_name;
          const lastName = data.rows[0].last_name;
          var salary = data.rows[0].salary;
          console.log("salary:" + salary);
          if ((typeof(salary) != "undefined") || salary == null) {
            salary = 0;
          }

          var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
          for (var i = 0; i < bids_res.rows.length; i++) {
            bids_res.rows[i].s_date = new Date(
              bids_res.rows[i].s_date - tzoffset
            );
            bids_res.rows[i].e_date = new Date(
              bids_res.rows[i].e_date - tzoffset
            );
          }

          
          
          pool.query(sql_query.query.check_fulltime, [username], (err, fulltime_data) => {
            role = "Part-Time Caretaker";
            console.log(fulltime_data.rows[0].is_fulltime);

            if (fulltime_data.rows[0].is_fulltime) {
              role = "Full-Time Caretaker";
              // document.getElementById("availability_table").style.visibility="hidden";
            };

            res.render("caretakers", {
              firstName: firstName,
              lastName: lastName,
              userName: username,
              salary: salary,
              bids: bids_res.rows,
              role: role,
              avails:avails,
              rating: rating,
              pet_days: pet_days,
              reviews: data1.rows
            });

          });

          
        }
      });
    });
  });
});

// Accept bid
router.get(
  "/:username/accept/:s_date/:e_date/:pouname/:name/:price",
  caretakerMiddleware(),
  function (req, res, next) {
    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds

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

    console.log("reach here");

    // pool.query(sql_query.query.add_bid_date, [s_date, e_date]);
    pool.query(
      sql_query.query.update_bid,
      [pouname, username, name, s_date, e_date, price],
      (err, res) => {
        if (err) {
          //console.log([pouname, username, name, s_date, e_date, price]);
          //console.log('error gajelas');
          console.log(err);
        } else {
          console.log(res);
        }
      }
    );

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
  }
);

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
  pool.query(
    sql_query.query.get_caretaker,
    [careTakerUsername],
    (err, data) => {
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
    }
  );
  return res.redirect("/petowners/" + pousername);
});

// Apply for leave
router.get("/:username/apply_for_leave", caretakerMiddleware(), async function (
  req,
  res,
  next
) {
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
  pool.query(
    sql_query.query.get_caretaker,
    [careTakerUsername],
    (err, data) => {
      if (err) {
        return next(err);
      } else {
        pool.query(sql_query.query.apply_for_leave, [username, s_date, e_date]);
      }
    }
  );
  return res.redirect("/caretakers/" + pousername);
});

var url = require('url');

// Profile page
router.get("/:username/:filter_cat", caretakerMiddleware(), function (req, res, next) {
  const username = req.params.username;
  var filter_cat = req.params.filter_cat;
  console.log("######################### Filter is here ############################");
  console.log(filter_cat);
  if (filter_cat === "price") {
    console.log("######################AMOUNT##################");
    path = url.parse(req.url, true);
    var amount = path.query.amount;
    filter_cat = amount;
    console.log(amount);
  } else if (filter_cat === "a_type") {
    filter_cat = "animal type";
  }

  var avails = [];
  pool.query(sql_query.query.get_availability, [username], (err, data) => {
    console.log(data.rows);
    avails = data.rows;
  });

  var rating = "No rating yet."
  pool.query(sql_query.query.get_rating, [username], (err, data) => {
    // console.log(data.rows[0].avg);
    if (data.rows != null) {
      rating = Math.round(data.rows[0].avg, 1);
    }
  });

  var pet_days = 0;
  pool.query(sql_query.query.get_num_of_pet_days, [username], (err, data) => {
    // console.log(data.rows[0].num_days);
    if (data.rows != null) {
      pet_days = data.rows[0].num_days;
    }
  });

  pool.query(sql_query.query.get_review, [username], (err, data1) => {
    pool.query(sql_query.query.caretaker_get_max, [filter_cat, username], (err, bids_res) => {
      pool.query(sql_query.query.get_user, [username], (err, data) => {
        if (err) {
          res.render("error", err);
        } else if (data.rows.length == 0) {
          res.send("User does not exist");
        } else {
          const firstName = data.rows[0].first_name;
          const lastName = data.rows[0].last_name;
          var salary = data.rows[0].salary;
          console.log("salary:" + salary);
          if ((typeof(salary) != "undefined") || salary == null) {
            salary = 0;
          }

          var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
          for (var i = 0; i < bids_res.rows.length; i++) {
            bids_res.rows[i].s_date = new Date(
              bids_res.rows[i].s_date - tzoffset
            );
            bids_res.rows[i].e_date = new Date(
              bids_res.rows[i].e_date - tzoffset
            );
          }

          pool.query(sql_query.query.check_fulltime, [username], (err, fulltime_data) => {
            role = "Part-Time Caretaker";
            console.log(fulltime_data.rows[0].is_fulltime);

            if (fulltime_data.rows[0].is_fulltime) {
              role = "Full-Time Caretaker";
              // document.getElementById("availability_table").style.visibility="hidden";
            };

            res.render("caretakers", {
              firstName: firstName,
              lastName: lastName,
              userName: username,
              salary: salary,
              bids: bids_res.rows,
              role: role,
              avails:avails,
              rating: rating,
              pet_days: pet_days,
              reviews: data1.rows
            });
            console.log("######################## reviews ################");
            console.log(data1.rows);

          });

          
        }
      });
    });
  });
});

module.exports = router;
