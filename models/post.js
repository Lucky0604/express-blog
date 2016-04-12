var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

// save a post
Post.prototype.save = function(cb) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + '-' + (date.getMonth() + 1),
        day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
        date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes(): date.getMinutes())
    };

    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    };

    // open the database
    mongodb.open(function(err, db) {
        if (err) {
            return cb(err);
        }
        // read the posts collection
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            // insert document into posts collection
            collection.insert(post, {
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                cb(null);
            });
        });
    });
};

// Read the post's info
Post.get = function(name, cb) {
    // open the database
    mongodb.open(function(err, db) {
        if (err) {
            return cb(err);
        }
        // read the posts collection
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return cb(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }

            // search the article based on query obj
            collection.find(query).sort({
                time: -1
            }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return cb(err);
                }
                // add markdown
                docs.forEach(function(doc) {
                    doc.post = markdown.toHTML(doc.post);
                })
                cb(null, docs);
            });
        });
    });

};
