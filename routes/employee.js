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
}).get('/employees/add', csrfProtection, auth, async (req, res) => {
    var success_message = req.flash('success-message')[0];
    var error_message = req.flash('error-message')[0];
    const firms = await Firm.findAll({});
    res.render('employees/add', { layout: 'dashboard', csrfToken: req.csrfToken(), firms, success_message,error_message  });
});

router.post('/employees/add', auth, csrfProtection, async (req, res) => {
    const data = await User.findAll({
        where: {
            email: req.body.email
        }
    });
    if(data.length === 0) {

    }
    else {
        req.flash('error-message', 'Email already taken.');
        res.redirect('/employees/add');
    }
});

module.exports = router;