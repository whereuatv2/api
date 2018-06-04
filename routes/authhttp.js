var _ = require('lodash');
var db = require('../lib/db')

module.exports = function(app) {

  app.get('/api/authhttp', function ( req, res ) {
    //todo figure out what we do at the root context
    res.json({"authhttp":"hello world!"});
    //db.setup();
  });

};

