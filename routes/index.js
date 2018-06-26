const express = require('express');
const passport = require('passport');
const csrf = require('csurf');

var csrfProtection = csrf({ cookie: true })

const router = express.Router();

router.get("/", csrfProtection, (req, res) => {
    
    var msg = req.flash('loginMessage')[0];
	var success_password_message = req.flash('success-password-message')[0];   
    res.render('login',{ layout: 'login', message: msg, csrfToken: req.csrfToken(), success_password_message: success_password_message });
}).post('/', csrfProtection, passport.authenticate('local-login', {
    //successRedirect : '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}), (req, res) => {
	if(req.user.role_id === 1){
    	res.redirect('/dashboard');
    }
    else if(req.user.role_id === 2)
    {
    	res.redirect('/dashboard');
    }
    else if(req.user.role_id === 3)
    {
    	res.redirect('/dashboard');
    }
    else if(req.user.role_id === 4)
    {
    	res.redirect('/dashboard');
    }

    if (req.body.remember_me) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
});

module.exports = router;