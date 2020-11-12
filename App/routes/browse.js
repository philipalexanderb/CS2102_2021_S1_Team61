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

  var pets = [];
  pool.query(sql_query.query.get_pets, [username], (err, data) => {
    pets = data.rows;
  });

  console.log(username);
  console.log(pets);
  
  pool.query(sql_query.query.browse, [], (err, data) => {
    console.log(data.rows);
    var username = req.session.passport.user;
    console.log(username);
    res.render("browse", { avails: data.rows, username: username, pets: pets });
  });
});

router.get("/:id", function (req, res, next) {
  console.log(req);
  console.log(req.params.id);
  const username = req.params.id;
  const pousername = req.session.passport.user;

  console.log("########### POUNAME FOR BROWSE ###################");
  console.log(pousername);

  console.log("########### USERNAME FOR BROWSE ###################");
  console.log(username);

  var bids = [];
  pool.query(sql_query.query.get_bid, [username], (err, data) => {
    bids = data.rows;
  });

  console.log("###################### BIDS HERE #####################")
  console.log(bids);

  setTimeout(() => {
    pool.query(sql_query.query.get_browsed_caretaker, [req.params.id], (err, data) => {
      console.log(data);
      res.render("browsed_caretaker", {
        username: data.rows[0].username,
        pousername: pousername,
        address: data.rows[0].address,
        first_name: data.rows[0].first_name,
        last_name: data.rows[0].last_name,
        bids: bids
       })
    });
  }, 2000); 

  // display_browsed_caretaker(username, bids, res);

  // get_bid(username, bids).then(() => display_browsed_caretaker(username, bids, res));
});

//  async function get_bid(username, bids) {
//   pool.query(sql_query.query.get_bid, [username], (err, data) => {
//     bids = data.rows;
//   });
// }

// async function display_browsed_caretaker(username, bids, res) {
//   await(get_bid(username, bids));
//   pool.query(sql_query.query.get_browsed_caretaker, [username], (err, data) => {
//     console.log(data);
//     res.render("browsed_caretaker", {
//       username: data.rows[0].username,
//       address: data.rows[0].address,
//       first_name: data.rows[0].first_name,
//       last_name: data.rows[0].last_name,
//       bids: bids
//      })
//   });
// }

module.exports = router;
