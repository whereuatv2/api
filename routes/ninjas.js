var _ = require("lodash");
var db = require("../lib/db");
var dbAccounts = require("../lib/dbAccounts");

module.exports = function(app) {
  /* Read */
  app.get("/api/ninjas", function(req, res) {
    console.log("req.user.sub:" + req.user.sub);
    console.log("req.whereuatUserId:" + req.whereuatUserId);
    dbAccounts.findUserByUserId(req.whereuatUserId, function(err, user) {
      if (err) {
        throw err;
      }
      if (user.ninjas) res.json(user.ninjas);
      else res.json([]);
    });
  });

  app.get("/api/ninjas/:id", function(req, res) {
    db.findUserById(req.params.id, function(err, user) {
      if (err) {
        throw err;
      }
      res.json(user);
    });
  });

  /* Delete */
  app.delete("/api/ninjas/:ninja_id", function(req, res) {
    //stop following this ninja

    //for now just hard code the user until we figure out how to get that info from the request
    username = "splinter";
    db.findUserByUsername(username, function(err, user) {
      if (err) throw err;
      db.removeNinjaForUserId(req.params.ninja_id, user.id, function(
        err,
        result
      ) {
        if (err) {
          throw err;
        }
        res.json(result);
      });
    });
  });
};
