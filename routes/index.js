var crypto = require('crypto');
var User = require('../models/users.js');
var Post = require('../models/post.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        Post.get(null, function(err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: 'MainPage',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    //route configuration
    //------------------------------------------------------------------------------------
    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: 'Regist',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
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
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res) {
        res.render('login', {
            title: 'Login',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        // create the password's md5 value
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        // check whether the use already exists
        User.get(req.body.name, function(err, user) {
            if (!user) {
                req.flash('error', 'User is not exist');
                return res.redirect('/login');
            }
            // check whether the password as the same
            if (user.password != password) {
                req.flash('error', 'password is error');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', 'Login successfully!');
            res.redirect('/');
        });
    });

    app.get('/post', checkLogin);
    app.get('/post', function(req, res) {
        res.render('post', {
            title: 'Post',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', 'Post successfully!');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req,res) {
        req.session.user = null;
        req.flash('success', 'Logout successfully!');
        res.redirect('/');
    });

    app.get('/upload', checkLogin);
    app.get('/upload', function(req, res) {
        res.render('upload', {
            title: 'Upload File',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })

    app.post('/upload', checkLogin);
    app.post('/upload', function(req, res) {
        req.flash('success', 'File upload successfully!');
        res.redirect('/upload');
    })

    // authenticate about login user and new user
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'Not login yet!');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', 'Already login!');
            res.redirect('back');
        }
        next();
    }
};
