var r = require("rethinkdb"),
  assert = require("assert"),
  logdebug = require("debug")("rdb:debug"),
  logerror = require("debug")("rdb:error");

var dbConfig = {
  host: "rethinkdb",
  port: 28015,
  db: "whereuat_ninja",
  tables: {
    locations: "id",
    users: "id"
  }
};

module.exports.findTwitterLocations = function(userId, callback) {
  console.log("userId:" + userId);
  onConnect(function(err, connection) {
    var query = r
      .db(dbConfig.db)
      .table("locations")
      .getAll(userId, { index: "user_id" })
      .filter(function(location) {
        return location("twitterUrl").ne("");
      })
      .orderBy(r.asc("time"));

    query.run(connection, function(err, cursor) {
      if (err) {
        logerror("ERROR findTwitterLocations:" + err.message);
        callback([]);
        connection.close();
      } else {
        cursor.toArray(function(err, results) {
          if (err) {
            logerror("ERROR findTwitterLocations:" + err.message);
            callback([]);
          } else {
            callback(results);
          }
          connection.close();
        });
      }
    });
  });
};

module.exports.updateLocationTwitterInfo = function(location, callback) {
  onConnect(function(err, connection) {
    r
      .db(dbConfig.db)
      .table("locations")
      .filter({ id: location["id"] })
      .update({
        twitter: location.twitter
      })
      .run(connection, function(err, result) {
        if (err) throw err;
        if (result.replaced === 1) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      });
  });
};

function onConnect(callback) {
  r.connect({ host: dbConfig.host, port: dbConfig.port }, function(
    err,
    connection
  ) {
    assert.ok(err === null, err);
    connection["_id"] = Math.floor(Math.random() * 10001);
    callback(err, connection);
  });
}
