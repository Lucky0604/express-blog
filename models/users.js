var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

// store the user's info
User.prototype.save = function(cb) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };

    // open the database
    mongodb.open(function(err, db) {
        if (err) {
            return cb(err);         // error, return the error message
        }
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            collection.insert(user, {
                safe: true
            }, function(err, user) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                cb(null, user[0]);      // success, err is null. and return the user's document
            });
        });
    });
};

// read the user's info
User.get = function(name, cb) {
    // open the database
    mongodb.open(function(err, db) {
        if (err) {
            return cb(err);
        }
        // read the users collection
        db.collection('users', function(err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            // search username(key: name) document
            collection.findOne({
                name: name
            }, function(err, user) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                cb(null, user);
            });
        });
    });
};
