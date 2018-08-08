const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// const dateFormat = require('dateformat');
const User = require('../models').user;
const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

/*==================================Bratin Meheta 15-06-2018===================================*/

router.get('/activity-goal', auth, firmAttrAuth, csrfProtection, (req, res) => {
	var success_message = req.flash('success-activityGoal-message')[0];
	var success_edit_message = req.flash('success-edit-goal-message')[0];
	var success_del_message = req.flash('success-delete-goal-message')[0];
	const formatFromDate2 = req.query.from_activity_goal_date ? req.query.from_activity_goal_date.split("-") : '';
	const formatToDate2 = req.query.to_activity_goal_date ? req.query.to_activity_goal_date.split("-") : '';
	var whereGoals = {};
	if(formatFromDate2)
	{
		whereGoals.from_date = formatFromDate2[2]+"-"+formatFromDate2[1]+"-"+formatFromDate2[0];
	}
	if(formatToDate2)
	{
		whereGoals.to_date = formatToDate2[2]+"-"+formatToDate2[1]+"-"+formatToDate2[0];
	}
	if (req.user.firm_id) {
		whereGoals.firm_id = req.user.firm_id.toString();
	} else {
		whereGoals.firm_id = req.user.firm_id;
	}
	//whereGoals.firm_id = req.user.firm_id
	if(req.user.role_id != 2)
	{
		whereGoals.user_id = req.user.id
	}
	ActivityGoal.belongsTo(Firm, {foreignKey: 'firm_id'});
	ActivityGoal.findAll({
		where: whereGoals,
		include: [{
            model: Firm
        }]
	}).then(goals =>{
	res.render('activity_goal/index', {
			layout: 'dashboard',
			success_message:success_message,
			success_edit_message: success_edit_message,
			success_del_message: success_del_message,
			goals:goals,
			from_activity_goal_date: req.query.from_activity_goal_date ? req.query.from_activity_goal_date : '',
			to_activity_goal_date: req.query.to_activity_goal_date ? req.query.to_activity_goal_date : ''
		});
	});
});

router.get('/activity-goal/add', auth, firmAttrAuth, csrfProtection, (req, res) => {
	res.render('activity_goal/add', { layout: 'dashboard', csrfToken: req.csrfToken()});
});

router.post('/activity-goal/add', auth, firmAttrAuth, csrfProtection, (req, res) => {
	const formatFromDate = req.body.from_date ? req.body.from_date.split("-") : '';
	const formatToDate = req.body.to_date ? req.body.to_date.split("-") : '';
	ActivityGoal.create({
		firm_id: req.user.firm_id,
		user_id: req.user.id,
		activity_goal: req.body.activity_goal,
		category: req.body.category,
		from_date: formatFromDate ? formatFromDate[2]+"-"+formatFromDate[1]+"-"+formatFromDate[0] : null,
		to_date: formatToDate ? formatToDate[2]+"-"+formatToDate[1]+"-"+formatToDate[0] : null,
		remarks: req.body.remarks
	   }).then(store =>{
		req.flash('success-activityGoal-message', 'Activity Goal Created Successfully');
		res.redirect('/activity-goal');
	});
});

router.get('/activity-goal/edit/:id', auth, firmAttrAuth, csrfProtection, (req, res) => {
	ActivityGoal.findById(req.params['id']).then(result => {
		res.render('activity_goal/edit', { layout: 'dashboard', csrfToken: req.csrfToken(), edit_goals: result})
	});
});


router.get('/activity-goal/view/:id', auth, firmAttrAuth, csrfProtection, (req, res) => {
	ActivityGoal.findById(req.params['id']).then(result => {
		res.render('activity_goal/view', { layout: 'dashboard', csrfToken: req.csrfToken(), edit_goals: result})
	});
});


router.post('/activity-goal/edit/:id', auth, firmAttrAuth, csrfProtection, (req, res) => {
	const formatFromDate1 = req.body.from_date ? req.body.from_date.split("-") : '';
	const formatToDate1 = req.body.to_date ? req.body.to_date.split("-") : '';
	ActivityGoal.update({
		activity_goal: req.body.activity_goal,
		category: req.body.category,
		from_date: formatFromDate1 ? formatFromDate1[2]+"-"+formatFromDate1[1]+"-"+formatFromDate1[0] : null,
		to_date: formatToDate1 ? formatToDate1[2]+"-"+formatToDate1[1]+"-"+formatToDate1[0] : null,
		remarks: req.body.remarks
	},{where: {id: req.params['id']}
	}).then(values => {
		req.flash('success-edit-goal-message', 'Activity Goal Edited Successfully');
    res.redirect('/activity-goal');
	});
});

router.get('/activity-goal/delete/:id', auth, firmAttrAuth, csrfProtection, (req, res) =>{
	ActivityGoal.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-delete-goal-message', 'Activity Goal Removed Successfully');
		res.redirect('/activity-goal');
	});
});

/*==================================Bratin Meheta 15-06-2018===================================*/

module.exports = router;
