var _ = require('lodash');
var db = require('../lib/db');
var accounts = require('../lib/dbAccounts');

module.exports = function(app) {
    /* Create */
    app.post( '/api/users', function ( req, res ) {
        accounts.addUpdateUser(req.body);
        accounts.findUserByAuthId(req.body.sub, function(err, user){
            if (err) { throw err; }
            res.json(user);
        });
    });
    /* Read */
    app.get('/api/users', function ( req, res ) {
        db.findAllUsers(function( err, users ) {
            if (err) { throw err; }
            res.json(users);
        });
    });

    app.get('/api/users/:id', function ( req, res ) {
        //todo add get stuff
    });

    /* Update */
    app.put('/api/users/:id', function ( req, res ) {
        //todo add update stuff
    });

    /* Delete */
    app.delete('/api/users/:id', function ( req, res ) {
        //todo add delete stuff
    });

};
