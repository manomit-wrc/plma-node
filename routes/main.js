const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/designations', csrfProtection, auth, (req, res) => {
    res.render('designation/index', { layout: 'dashboard', csrfToken: req.csrfToken() });
});

module.exports = router;