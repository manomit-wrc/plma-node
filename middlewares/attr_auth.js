module.exports = (req, res, next) => {
    if(req.isAuthenticated() && req.user.role_id == 3) {
        const ulrArr = req.originalUrl.split("/");
        delete req.user.password;
        res.locals.user = req.user;
        res.locals.client_url = ulrArr[1];
        return next();
    }
    res.redirect('/');
};