console.log("/api");
var express = require("express");
var app = express();
var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
var dotenv = require("dotenv");
var bodyParser = require("body-parser");

console.log("before userIdAuth");
var userIdAuth = require("./userIdAuth");
console.log("before lib/db");
var db = require("./lib/db");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://feeldaburn.auth0.com/.well-known/jwks.json"
  }),
  audience: "http://localhost/api",
  issuer: "https://feeldaburn.auth0.com/",
  algorithms: ["RS256"]
});

app.use("/api/locations", [jwtCheck, userIdAuth]);
app.use("/api/ninjas", [jwtCheck, userIdAuth]);
app.use("/api/users", [jwtCheck, userIdAuth]);
app.use("/api/twitter-setup", [jwtCheck, userIdAuth]);
app.use("/api/authhttp", [jwtCheck, userIdAuth]);
app.use("/api/ping", function(req, res) {
  res.send("Hello world");
});

db.setup();

var index = require("./routes/index.js")(app);
var users = require("./routes/users.js")(app);
var locations = require("./routes/locations.js")(app);
var twitter = require("./routes/twitter.js")(app);
var ninjas = require("./routes/ninjas.js")(app);
var authhttp = require("./routes/authhttp.js")(app);

var server = app.listen(3000, function() {
  console.log("Server running at http://127.0.0.1:3000/");
});
