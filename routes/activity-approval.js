const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
var csrfProtection = csrf({
	cookie: true
});

const router = express.Router();


router.get('/activity-approvals', auth, firmAttrAuth, csrfProtection, async (req, res) => {

	console.log("activity-approval");
    

	res.render('activity/addactivity', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
	});
});