const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const user = require('../models').user;
var csrfProtection = csrf({ cookie: true });
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
var xlsx = require('node-xlsx');
const router = express.Router();

//====================================================================================================================================================//

router.get('/forgot-password', csrfProtection, (req, res) => {

    res.render('forgot_password', {
      layout: 'login',
      csrfToken: req.csrfToken()

  });
});

//
// router.get('/', csrfProtection, (req, res) => {
//
// });
/*============================Ends Import Client Excel Data =====================================*/
module.exports = router;
