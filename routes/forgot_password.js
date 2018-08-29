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

    var email_body =`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
    @media screen and (max-width: 720px) {
      body .c-v84rpm {
        width: 100% !important;
        max-width: 720px !important;
      }
      body .c-v84rpm .c-7bgiy1 .c-1c86scm {
        display: none !important;
      }
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-pekv9n .c-1qv5bbj,
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-1c9o9ex .c-1qv5bbj,
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-90qmnj .c-1qv5bbj {
        border-width: 1px 0 0 !important;
      }
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-183lp8j .c-1qv5bbj {
        border-width: 1px 0 !important;
      }
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-pekv9n .c-1qv5bbj {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-1c9o9ex .c-1qv5bbj,
      body .c-v84rpm .c-7bgiy1 .c-f1bud4 .c-90qmnj .c-1qv5bbj {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      body .c-v84rpm .c-ry4gth .c-1dhsbqv {
        display: none !important;
      }
    }
  
  
    @media screen and (max-width: 720px) {
      body .c-v84rpm .c-ry4gth .c-1vld4cz {
        padding-bottom: 10px !important;
      }
    }
  </style>
  <title>Recover your password</title>
  </head>
  
  <body style="margin: 0; padding: 0; font-family: &quot; HelveticaNeueLight&quot;,&quot;HelveticaNeue-Light&quot;,&quot;HelveticaNeueLight&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,Helvetica,Arial,&quot;LucidaGrande&quot;,sans-serif;font-weight: 300; font-stretch: normal; font-size: 14px; letter-spacing: .35px; background: #EFF3F6; color: #333333;">
    <table border="1" cellpadding="0" cellspacing="0" align="center" class="c-v84rpm" style="border: 0 none; border-collapse: separate; width: 720px;" width="720">
      <tbody>
        <tr class="c-1syf3pb" style="border: 0 none; border-collapse: separate; height: 114px;">
          <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle">
            <table align="center" border="1" cellpadding="0" cellspacing="0" class="c-f1bud4" style="border: 0 none; border-collapse: separate;">
              <tbody>
                <tr align="center" class="c-1p7a68j" style="border: 0 none; border-collapse: separate; padding: 16px 0 15px;">
                  <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle"><img alt="" src="http://plmadev.myperformlaw.com/assets/pages/img/Perform_Law.png" class="c-1shuxio" style="border: 0 none; line-height: 100%; outline: none; text-decoration: none; height: 67px; width: 200px;" width="200" height="67"></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr class="c-7bgiy1" style="border: 0 none; border-collapse: separate; -webkit-box-shadow: 0 3px 5px rgba(0,0,0,0.04); -moz-box-shadow: 0 3px 5px rgba(0,0,0,0.04); box-shadow: 0 3px 5px rgba(0,0,0,0.04);">
          <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle">
            <table align="center" border="1" cellpadding="0" cellspacing="0" class="c-f1bud4" style="border: 0 none; border-collapse: separate; width: 100%;" width="100%">
              <tbody>
                <tr class="c-pekv9n" style="border: 0 none; border-collapse: separate; text-align: center;" align="center">
                  <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle">
                    <table border="1" cellpadding="0" cellspacing="0" width="100%" class="c-1qv5bbj" style="border: 0 none; border-collapse: separate; border-color: #E3E3E3; border-style: solid; width: 100%; border-width: 1px 1px 0; background: #FBFCFC; padding: 40px 54px 42px;">
                      <tbody>
                        <tr style="border: 0 none; border-collapse: separate;">
                          <td class="c-1m9emfx c-zjwfhk" style="border: 0 none; border-collapse: separate; vertical-align: middle; font-family: &quot; HelveticaNeueLight&quot;,&quot;HelveticaNeue-Light&quot;,&quot;HelveticaNeueLight&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,Helvetica,Arial,&quot;LucidaGrande&quot;,sans-serif;font-weight: 300; color: #1D2531; font-size: 25.45455px;"
                          valign="middle">Reset Password</td>
                        </tr>
                        <tr style="border: 0 none; border-collapse: separate;">
                          <td class="c-46vhq4 c-4w6eli" style="border: 0 none; border-collapse: separate; vertical-align: middle; font-family: &quot; HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeueRoman&quot;,&quot;HelveticaNeue-Roman&quot;,&quot;HelveticaNeueRoman&quot;,&quot;HelveticaNeue-Regular&quot;,&quot;HelveticaNeueRegular&quot;,Helvetica,Arial,&quot;LucidaGrande&quot;,sans-serif;font-weight: 400; color: #7F8FA4; font-size: 15.45455px; padding-top: 20px;"
                          valign="middle">Looks like you lost your password?</td>
                        </tr>
                        <tr style="border: 0 none; border-collapse: separate;">
                          <td class="c-eitm3s c-16v5f34" style="border: 0 none; border-collapse: separate; vertical-align: middle; font-family: &quot; HelveticaNeueMedium&quot;,&quot;HelveticaNeue-Medium&quot;,&quot;HelveticaNeueMedium&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,sans-serif;font-weight: 500; font-size: 13.63636px; padding-top: 12px;"
                          valign="middle">We have received your request for a forgotten password. Your Password Is = `+ genPassword +`</td>
                        </tr>
                        <tr style="border: 0 none; border-collapse: separate;">
                          <td class="c-rdekwa" style="border: 0 none; border-collapse: separate; vertical-align: middle; padding-top: 38px;" valign="middle"><a href="http://localhost:5000/" target="_blank"
                            class="c-1eb43lc c-1sypu9p c-16v5f34" style="color: #000000; -webkit-border-radius: 4px; font-family: &quot; HelveticaNeueMedium&quot;,&quot;HelveticaNeue-Medium&quot;,&quot;HelveticaNeueMedium&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,sans-serif;font-weight: 500; font-size: 13.63636px; line-height: 15px; display: inline-block; letter-spacing: .7px; text-decoration: none; -moz-border-radius: 4px; -ms-border-radius: 4px; -o-border-radius: 4px; border-radius: 4px; background-color: #FF881F; background-image: url(&quot;https://mail.crisp.chat/images/linear-gradient(-1deg,#137ECE2%,#288BD598%)&quot; );color: #ffffff; padding: 12px 24px;">Back TO LogIn Page</a></td>
                          </tr>
                          <tr style="border: 0 none; border-collapse: separate;">
                            <td class="c-ryskht c-zjwfhk" style="border: 0 none; border-collapse: separate; vertical-align: middle; font-family: &quot; HelveticaNeueLight&quot;,&quot;HelveticaNeue-Light&quot;,&quot;HelveticaNeueLight&quot;,&quot;HelveticaNeue&quot;,&quot;HelveticaNeue&quot;,Helvetica,Arial,&quot;LucidaGrande&quot;,sans-serif;font-weight: 300; font-size: 12.72727px; font-style: italic; padding-top: 52px;"
                            valign="middle">If you have any questions, just reply to this email — we're always happy to help out.</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="c-183lp8j" style="border: 0 none; border-collapse: separate;">
                    <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle">
                      <table border="1" cellpadding="0" cellspacing="0" width="100%" class="c-1qv5bbj" style="border: 0 none; border-collapse: separate; border-color: #E3E3E3; border-style: solid; width: 100%; background: #FFFFFF; border-width: 1px; font-size: 11.81818px; text-align: center; padding: 18px 40px 20px;"
                      align="center">
                      <tbody>
                        <tr style="border: 0 none; border-collapse: separate;">
                          <td style="border: 0 none; border-collapse: separate; vertical-align: middle;" valign="middle"><span class="c-1w4lcwx">You receive this email because you or someone initiated a password recovery operation on your Performlaw account.</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>`


    const request = sendmail
      .post("send", {
        url: 'api.mailjet.com'
      })
      .request({
        FromEmail: 'malini@wrctpl.com',
        FromName: 'plma.attorneymanagement.com',
        Subject: 'FORGOT PASSWORD',
        
			  'Html-part': email_body,

        // 'Text-part': 'Your new password is: ' + genPassword,
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
