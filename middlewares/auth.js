module.exports = (req, res, next) => {
    if(req.isAuthenticated()) {
        delete req.user.password;
        res.locals.user = req.user;
        return next();
    }
    res.redirect('/');
};