var dbAccounts = require('./lib/dbAccounts')

module.exports = function(req, res, next) {
    if (req.user) {
        try {
            dbAccounts.findUserIdFromAuthId(req.user.sub, function(err, userId) {
                if (err || !userId) { return next(); }
                console.log("userId: "+userId);
                req.whereuatUserId = userId;
                return next();
            });
        } catch (err) {
            return next();
        }
    } else {
        next();
    }
};

