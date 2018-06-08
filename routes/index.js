const express = require('express');
const passport = require('passport');
const csrf = require('csurf');

var csrfProtection = csrf({ cookie: true })

const router = express.Router();

router.get("/", csrfProtection, (req, res) => {
    
    var msg = req.flash('loginMessage')[0];
    
    res.render('login',{ layout: 'login', message: msg, csrfToken: req.csrfToken() });
}).post('/', csrfProtection, passport.authenticate('local-login', {
    successRedirect : '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}), (req, res) => {

});

module.exports = router;