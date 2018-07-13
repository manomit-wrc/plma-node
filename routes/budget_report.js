const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const lodash = require("lodash");
const User = require('../models').user;
const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;
const activityBudget = require('../models').activity_budget;

var csrfProtection = csrf({
    cookie: true
});

const router = express.Router();

router.get('/budget-report', auth, csrfProtection, (req, res) =>{

    res.render('activity_budget_report/index', {layout: 'dashboard'});
});

module.exports = router;