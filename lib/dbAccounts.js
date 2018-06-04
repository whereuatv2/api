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

module.exports.addUpdateUser = function(user, callback) {
  var dbUserInsert = {
    name: user.name,
    email: user.email || "",
    authIds: [user.sub],
    picture: user.picture,
    ninjas: []
  };

  var dbUserUpdate = {
    name: user.name,
    email: user.email,
    picture: user.picture
  };

  onConnect(function(err, connection) {
    r
      .branch(
        r
          .table("users")
          .filter(r.row("authIds").contains(user.sub))
          .isEmpty(),
        r.table("users").insert(dbUserInsert, { conflict: "update" }),
        r.table("users")
      )
      .run(connection, function(err, result) {
        if (err) {
          logerror("[ERROR] Failed to add database user " + err.message);
        }
      });
  });
};

module.exports.findUserIdFromAuthId = function(authId, callback) {
  onConnect(function(err, connection) {
    r
      .table("users")
      .filter(r.row("authIds").contains(authId))
      .pluck("id")
      .run(connection, function(err, result) {
        if (err) {
          logerror("[ERROR] Failed to find user " + err.message);
          callback(null, null);
        } else {
          result.next(function(err, row) {
            if (err) {
              callback(null, null);
            } else {
              callback(err, row.id);
            }
          });
        }
        connection.close();
      });
  });
};

module.exports.findUserByAuthId = function(authId, callback) {
  onConnect(function(err, connection) {
    r
      .table("users")
      .filter(r.row("authIds").contains(authId))
      .merge(function(user) {
        return {
          ninjas: r.expr(
            r
              .table("users")
              .getAll(r.args(user("ninjas")))
              .coerceTo("Array")
              .pluck("email", "name", "id")
          )
        };
      })
      .run(connection, function(err, result) {
        if (err) {
          logerror("[ERROR] Failed to find user " + err.message);
          callback(null, null);
        } else {
          result.next(function(err, row) {
            callback(err, row);
          });
        }
        connection.close();
      });
  });
};

// module.exports.findUsersByIdList = function(userIdList) {
//   onConnect(function(err, connection) {
//     r.table("users").getAll(userIdList);
//   });
// };

module.exports.findUserByUserId = function(userId, callback) {
  onConnect(function(err, connection) {
    r
      .table("users")
      .get(userId)
      .merge(function(user) {
        return {
          ninjas: r.expr(
            r
              .table("users")
              .getAll(r.args(user("ninjas")))
              .coerceTo("Array")
              .pluck("email", "name", "id")
          )
        };
      })
      .run(connection, function(err, result) {
        if (err) {
          logerror("[ERROR] Failed to find user " + err.message);
          callback(null, null);
        } else {
          callback(err, result);
        }
        connection.close();
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
    connection.use(dbConfig.db);
    callback(err, connection);
  });
}
