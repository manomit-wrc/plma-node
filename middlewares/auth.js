module.exports = (req, res, next) => {
    if(req.isAuthenticated()) {
        delete req.user.password;
        res.locals.user = req.user;
        res.locals.client_url = req.originalUrl.substr(1);
        return next();
    }
    res.redirect('/');
};