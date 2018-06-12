const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const User = require('../models').user;
const Firm = require('../models').firm;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/firms', csrfProtection, auth, (req, res) => {
    res.render('firms/index', { layout: 'dashboard', csrfToken: req.csrfToken() });
});
router.post('/firms/add', auth, csrfProtection, (req, res) => {
    console.log(req.body);
});

module.exports = router;