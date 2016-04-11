var flash = require('connect-flash');
var crypto = require('crypto');
var User = require('../models/users.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', {title: 'MainPage'});
    });

    //route configuration
    //------------------------------------------------------------------------------------
    app.get('/reg', function(req, res) {
        res.render('reg', {title: 'Regist'});
    });
    app.post('/reg', function(req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        // check the password if it is not the same
        if (password_re != password) {
            req.flash('error', 'Password is not the same');
            // return the regist page
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });

        // check whether the username already exists
        User.get(newUser.name, function(err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (user) {
                req.flash('error', 'User has already exists');
                return res.redirect('/reg');
            }
            // if it is not exist, add the user
            newUser.save(function(err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = user;    // user's info saved in session
                req.flash('success', 'Regist successfully!');
                res.redirect('/');
            })
        })
    });
    app.get('/login', function(req, res) {
        res.render('login', {title: 'Login'});
    });
    app.post('/login', function(req, res) {

    });
    app.get('/post', function(req, res) {
        res.render('post', {title: 'Post'});
    });
    app.post('/post', function(req, res) {

    });
    app.get('/logout', function(req,res) {

    });
}
