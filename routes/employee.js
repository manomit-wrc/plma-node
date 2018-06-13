const router = require('express').Router();
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const EmployeeToFirm = require('../models').employee_to_firm;

var csrfProtection = csrf({ cookie: true });

router.get('/employees', auth, (req, res) => {
    res.render('employees/index', { layout: 'dashboard' });
}).get('/employees/add', csrfProtection, auth, (req, res) => {
    res.render('employees/add', { layout: 'dashboard', csrfToken: req.csrfToken() });
});

module.exports = router;