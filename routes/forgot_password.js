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

    var email_body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width">
  <meta name="format-detection" content="telephone=no">
  <!--[if !mso]>
    <!-->
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800,300&subset=latin" rel="stylesheet" type="text/css">
      <!--<![endif]-->
      <title>Performlaw Password Reset</title>
      <style type="text/css">
      *{
       margin:0;
       padding:0;
       font-family:'OpenSans-Light', "Helvetica Neue", "Helvetica",Calibri, Arial, sans-serif;
       font-size:100%;
       line-height:1.6;
     }
     img{
       max-width:100%;
     }
     body{
       -webkit-font-smoothing:antialiased;
       -webkit-text-size-adjust:none;
       width:100%!important;
       height:100%;
     }
     a{
       color:#348eda;
     }
     .btn-primary{
       text-decoration:none;
       color:#FFF;
       background-color:#a55bff;
       border:solid #a55bff;
       border-width:10px 20px;
       line-height:2;
       font-weight:bold;
       margin-right:10px;
       text-align:center;
       cursor:pointer;
       display:inline-block;
     }
     .last{
       margin-bottom:0;
     }
     .first{
       margin-top:0;
     }
     .padding{
       padding:10px 0;
     }
     table.body-wrap{
       width:100%;
       padding:0px;
       /*padding-top:20px;*/
       margin:0px;
     }
     table.body-wrap .container{
       border:1px solid #f0f0f0;
     }
     table.footer-wrap{
       width:100%;
       clear:both!important;
     }
     .footer-wrap .container p{
       font-size:12px;
       color:#666;
     }
     table.footer-wrap a{
       color:#999;
     }
     .footer-content{
       margin:0px;
       padding:0px;
     }
     h1,h2,h3{
       color:#717372;
       font-family:'OpenSans-Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
       line-height:1.2;
       margin-bottom:15px;
       margin:40px 0 10px;
       font-weight:200;
     }
     h1{
       font-family:'Open Sans Light';
       font-size:45px;
     }
     h2{
       font-size:28px;
     }
     h3{
       font-size:22px;
     }
     p,ul,ol{
       margin-bottom:10px;
       font-weight:normal;
       font-size:14px;
     }
     ul li,ol li{
       margin-left:5px;
       list-style-position:inside;
     }
     .container{
       display:block!important;
       max-width:600px!important;
       margin:0 auto!important;
       clear:both!important;
     }
     .body-wrap .container{
       padding:0px;
     }
     .content,.footer-wrapper{
       max-width:600px;
       margin:0 auto;
       padding:20px 33px 20px 37px;
       display:block;
     }
     .content table{
       width:100%;
     }
     .content-message p{
       margin:20px 0px 20px 0px;
       padding:0px;
       font-size:22px;
       line-height:38px;
       margin: 0;
       font-family:'OpenSans-Light',Calibri, Arial, sans-serif;
     }
     .content-message h1 {
      margin-top: 10px;
    }
    .preheader{
     display:none !important;
     visibility:hidden;
     opacity:0;
     color:transparent;
     height:0;
     width:0;
   }
   .logo {
    display: table;
    margin: 0 auto;
  }
</style>
</head>

<body bgcolor="#f6f6f6">
  <span class="preheader" style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
    You’re back in the game
  </span>

  <!-- body -->
  <table class="body-wrap" width="600">
    <tr>
      <td class="container" bgcolor="#FFFFFF">
        <!-- content -->
        <table border="0" cellpadding="0" cellspacing="0" class="contentwrapper" width="600">
          <tr>
            <td style="height:25px; background: #FF9B44;">

            </td>
          </tr>
          <tr>
            <td>
              <div class="content">
                <table class="content-message">
                  <!-- <tr>
                    <td>&nbsp;</td>
                  </tr> -->
                  <tr>
                    <td align="left">
                      <a href="#">
                        <img class="logo" src="http://plmadev.myperformlaw.com/assets/pages/img/Perform_Law.png" width="250" border="0">
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-message" style="font-family:'Calibri',OpenSans-Light, Arial, sans-serif; color: #595959;">
                      <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;"> Hi, ` + user_email.first_name + " " + user_email.last_name + `! </p>
                      <p style = "font-size: 18px;"> You are receiving this email because we received a password reset request for your account. </p>
                      
                      <p style="font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                        Your New Password is - <span style = "color:#FF851A; font-weight: bold;" > ` + genPassword + ` </span>
                      </p>
                      <p style="font-size: 18px;">Please keep it secret, keep it safe!</p>

                      <p style="font-family: 'Open Sans Light',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;">&nbsp;</p>
                      <table width="325" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
    margin: 0 auto;">
                            <a href="http://localhost:5000/" align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click to sign in</a>
                          </td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      </table>

                      <p style="font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif; font-size:14px; line-height:26px; margin-top: 20px;">Warm Regards,<br> Perform Law!</p>  
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="height:25px; background: #FF9B44;">

              </td>
            </tr>
            
          </table>
          <!-- /content -->
        </td>
        <td></td>
      </tr>
    </table>
    <!-- /body -->
  </body>

  </html>`


    const request = sendmail
      .post("send", {
        url: 'api.mailjet.com'
      })
      .request({
        FromEmail: 'malini@wrctpl.com',
        FromName: 'plma.attorneymanagement.com',
        Subject: 'Password Reset',
        
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
