const express = require('express');
const passport = require('passport');
const csrf = require('csurf');
const User = require('../models').user;

var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();

router.get("/", csrfProtection, (req, res) => {
    var msg = req.flash('loginMessage')[0];
    var resetMsg = req.flash('loginSuccessMessage')[0];
    var success_password_message = req.flash('success-password-message')[0];
    res.render('login', {
        layout: 'login',
        message: msg,
        resetMsg,
        csrfToken: req.csrfToken(),
        success_password_message: success_password_message
    });
}).post('/', csrfProtection, passport.authenticate('local-login', {
    failureRedirect: '/',
    failureFlash: true
}), async (req, res) => {
    if (req.user.actual_role_id === 0) {
        if (req.user.role_id === 1) {
            res.redirect('/dashboard');
        } else if (req.user.role_id === 2) {
            res.redirect('/dashboard');
        } else if (req.user.role_id === 3) {
            res.redirect('/dashboard');
        } else if (req.user.role_id === 4) {
            res.redirect('/dashboard');
        }
    }
    else if (req.user.actual_role_id === 2) {
        var actual_role = req.user.actual_role_id;
        const change_role = await User.update({
            role_id: actual_role,
            actual_role_id: 0
        }, {
            where: {
                id: req.user.id
            }
        });
        res.redirect('/dashboard');
    }
    else if (req.user.actual_role_id === 1) {
        var actual_role = req.user.actual_role_id;
        const change_role = await User.update({
            role_id: actual_role,
            firm_id: null,
            actual_role_id: 0
        }, {
            where: {
                id: req.user.id
            }
        });
        res.redirect('/dashboard');
    }

    if (req.body.remember_me) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
        req.session.cookie.expires = false;
    }
});

module.exports = router;
