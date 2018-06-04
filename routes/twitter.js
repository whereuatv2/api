var OAuth2 = require("OAuth").OAuth2;
const https = require("https");
var rp = require("request-promise");
var dbLocations = require("../lib/dbLocations");

module.exports = function(app) {
  app.get("/api/twitter-setup", function(req, res, next) {
    buildOauth2Object().getOAuthAccessToken(
      "",
      {
        grant_type: "client_credentials"
      },
      function(e, accessToken) {
        dbLocations.findTwitterLocations(req.whereuatUserId, function(
          locations
        ) {
          console.log("locations.length:" + locations.length);
          locations.forEach(location => {
            getTweetData(accessToken, location.twitterUrl, function(tweetData) {
              location.twitter = tweetData;
              dbLocations.updateLocationTwitterInfo(location, function(
                error,
                isSuccessful
              ) {
                console.log("isSuccessful:" + isSuccessful);
              });
            });
          });
        });
      }
    );
  });

  function getTweetData(accessToken, twitterUrl, callback) {
    var tweetId = getTweetIdFromUrl(twitterUrl);
    var options = {
      hostname: "api.twitter.com",
      path: "/1.1/statuses/show.json?id=" + tweetId,
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };

    https.get(options, function(result) {
      var buffer = "";
      result.setEncoding("utf8");
      result.on("data", function(data) {
        buffer += data;
      });
      result.on("end", function() {
        var tweet = JSON.parse(buffer);
        //console.dir(tweet);
        var tweetData = {
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          twitterUrl: twitterUrl,
          media: []
        };
        //TODO:and getting more than just the id and text into each location
        if (tweet.entities) {
          tweet.entities.media.forEach(media => {
            var filteredMedia = {
              media_url: media.media_url,
              media_url_https: media.media_url_https
            };
            if (media.sizes) {
              filteredMedia.sizes = media.sizes;
            }
            tweetData.media.push(filteredMedia);
          });
        }
        callback(tweetData);
      });
    });
  }

  function getTweetIdFromUrl(twitterUrl) {
    var splitUrl = twitterUrl.split("/");
    return splitUrl[splitUrl.length - 1];
  }

  function buildOauth2Object() {
    console.log("key:" + process.env.TWITTER_KEY);
    console.log("secret:" + process.env.TWITTER_SECRET);
    return new OAuth2(
      process.env.TWITTER_KEY,
      process.env.TWITTER_SECRET,
      "https://api.twitter.com/",
      null,
      "oauth2/token",
      null
    );
  }
};
