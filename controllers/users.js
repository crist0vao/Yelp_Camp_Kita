const User = require('../models/user');

module.exports.renderUserRegister = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `${registeredUser.username}, welcome to YelpCamp!`);
            res.redirect('/campgrounds');
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/campgrounds');
    }
};

module.exports.renderLogin = async (req, res) => {
    try {
        res.render('users/login');
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/campgrounds');
    }
};

module.exports.usersLogin = async (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
};

module.exports.renderLogout = (req, res) => {
    req.logout();
    //req.session.destroy();
    req.flash('error', 'Goodbye!')
    res.redirect('/campgrounds');
};