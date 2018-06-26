const express = require('express');
const auth = require('../middlewares/auth');
const firmAuth = require('../middlewares/firm_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// const dateFormat = require('dateformat');
const User = require('../models').user;
const Firm = require('../models').firm;
const FinancialGoal = require('../models').financial_goal;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

/*===============================STARTS FINANCIAL SECTION Bratin Meheta 26-06-2018============================*/

router.get('/financial-goal', auth, firmAuth, csrfProtection, async (req, res)=> {
	var success_message = req.flash('success-financialGoal-message')[0];
	var success_finan_edit_message = req.flash('success-edit-finalgoal-message')[0];
	var success_finan_del_message = req.flash('success-delete-finan-goal-message')[0];
	var searchFinancialGoal = {};
	if(req.query.search_attorney) {
        searchFinancialGoal.attorney_id = req.query.search_attorney;
    }
    if(req.query.search_year)
    {
        searchFinancialGoal.year = req.query.search_year;
    }
    searchFinancialGoal.firm_id = req.user.firm_id
	FinancialGoal.belongsTo(User, {foreignKey: 'attorney_id'});
	const financialGoal = await FinancialGoal.findAll({
		where: searchFinancialGoal,
		include: [{
            model: User
        }]
	});
	const attorney = await User.findAll({
		where: {role_id: 3}
	});
	var year = [];
	for(var i=2018; i<=2040;i++){
		year.push(i);
	}
	res.render('financial_goal/index', {
		layout: 'dashboard',
		success_message, 
		financialGoal, 
		success_finan_edit_message, 
		success_finan_del_message, 
		attorney, 
		year,
		search_attorney: req.query ? req.query.search_attorney : '', 
        search_year: req.query ? req.query.search_year : ''
	});
});

router.get('/financial-goal/add', auth, firmAuth, csrfProtection, async (req, res)=> {
	var year = [];
	for(var i=2018; i<=2040;i++){
		year.push(i);
	}
	const attorney = await User.findAll({
		where: {role_id: 3}
	});
	res.render('financial_goal/add', {layout: 'dashboard', csrfToken: req.csrfToken(), year, attorney});
});

router.post("/financial-goal/add", auth, firmAuth, csrfProtection, async(req,res)=> {
	const add_financial_goal = await FinancialGoal.create({
		firm_id: req.user.firm_id,
		attorney_id: req.body.attr_id,
		year: req.body.year,
		year_goal: req.body.year_goal,
		year_goal_percentage: req.body.year_goal_precentage,
		summary: req.body.summary_info,
		remarks: req.body.remarks,
	});
	req.flash('success-financialGoal-message', 'Financial Goal Created Successfully');
    res.redirect('/financial-goal')
});

router.get("/financial-goal/edit/:id", auth, firmAuth, csrfProtection, async (req, res)=> {
	var year = [];
	for(var i=2018; i<=2040;i++){
		year.push(i);
	}
	const edit_financial_goal = await FinancialGoal.findById(req.params['id']);
	const attorney = await await User.findAll({
		where: {role_id: 3}
	});
	res.render('financial_goal/edit', {layout: 'dashboard', csrfToken: req.csrfToken(), finan_goal: edit_financial_goal, attorney, year});
});

router.post("/financial-goal/edit/:id", auth, firmAuth, csrfProtection, async (req, res) => {
	const edit_finan_goal = await FinancialGoal.update({
		firm_id: req.user.firm_id,
		attorney_id: req.body.attr_id,
		year: req.body.year,
		year_goal: req.body.year_goal,
		year_goal_percentage: req.body.year_goal_precentage,
		summary: req.body.summary_info,
		remarks: req.body.remarks,
	},{where: {id : req.params['id']}
	});
	req.flash('success-edit-finalgoal-message', 'Financial Goal Updated Successfully');
    res.redirect('/financial-goal');
});

router.get("/financial-goal/delete/:id", auth, firmAuth, csrfProtection, async (req, res) => {
	const del_financial_goal = await FinancialGoal.destroy({
		where: {
			id: req.params['id']
		}
	});
	req.flash('success-delete-finan-goal-message', 'Financial Goal Removed Successfully');
	res.redirect('/financial-goal');
});

/*===============================ENDS FINANCIAL SECTION Bratin Meheta 26-06-2018==============================*/

module.exports = router;