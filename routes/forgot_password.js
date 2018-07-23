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
var csrfProtection = csrf({
  cookie: true
});
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
var xlsx = require('node-xlsx');
const router = express.Router();

const sendmail = require('node-mailjet').connect('b9b8c1979e9b71715ab00ca4ea621e4e', '48ba3e55307333a99fcba3fc60e0a66e');


var async = require('async');
var crypto = require('crypto');

//====================================================================================================================================================//

router.get('/forgot-password', csrfProtection, (req, res) => {
  var err_message = req.flash('success-err-message')[0];
  var err_captcha_message = req.flash('loginCaptchaMessage')[0];
  res.render('forgot_password', {
    layout: 'login',
    err_message,
    err_captcha_message,
    csrfToken: req.csrfToken()
  });
});



// {{ mail send code}}



router.post('/forgot', csrfProtection, async (req, res) => {
  //console.log(req.body.u_mail);

  let user_email;
  user_email = await User.findOne({
    where: {
      email: req.body.u_mail
    }
  });

  if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    req.flash('loginCaptchaMessage', 'Please select captcha');
    res.redirect('/forgot-password');
  }
  else if (user_email == null) {
    req.flash('success-err-message', 'Email ID does not exists');
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
        FromName: 'plma.attorneymanagement.com',
        Subject: 'FORGOT PASSWORD',
        'Text-part': 'Your new password is: ' + genPassword,
        Recipients: [{
          'Email': req.body.u_mail
        }]
      })

    //updated
    await User.update({
      password: bCrypt.hashSync(genPassword)
    }, {
      where: {
        id: user_email.id
      }
    });

    req.flash('loginSuccessMessage', 'New password has been sent to your Email. Please check your Email.');
    res.redirect('/');

  }

});

/*============================Ends Import Client Excel Data =====================================*/
module.exports = router;
