const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
var csrfProtection = csrf({ cookie: true });
const router = express.Router();

const sendmail  = require('node-mailjet').connect('b9b8c1979e9b71715ab00ca4ea621e4e', '48ba3e55307333a99fcba3fc60e0a66e');

var async = require('async');
var crypto = require('crypto');

//====================================================================================================================================================//

router.get('/forgot-password', csrfProtection, (req, res) => {
    var err_message = req.flash('success-err-message')[0];
    var password_message = req.flash('new_message')[0];

    res.render('forgot_password', {
        layout: 'login',
        err_message,
        password_message,
        csrfToken: req.csrfToken()
    });
});

router.post('/forgot', csrfProtection, async (req, res) => {
    let user_email;
    user_email = await User.findOne({
        where: {
            email: req.body.u_mail
        }
    });

    if (user_email == null) {
        req.flash('success-err-message', 'This Email ID is not exists to database');
        res.redirect('/forgot-password');
    } else {
        function generatePassword() {
            var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }
        var genPassword = generatePassword();

        const request = sendmail
        .post("send", {
            url: 'api.mailjet.com'
        })
        .request({
            FromEmail: 'malini@wrctpl.com',
            FromName: 'Mailjet Pilot',
            Subject: 'FORGOT PASSWORD',
            'Text-part': 'new password: '+genPassword,
            Recipients: [{'Email': req.body.u_mail}]
        })

        await User.update({
            password: bCrypt.hashSync(genPassword)
        },{
            where: {
                id: user_email.id
            }
        });
    }
    req.flash('new_message', 'The new password is sent to tour mail');
    res.redirect('/forgot-password');
});

module.exports = router;
