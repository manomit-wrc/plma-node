const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;
const Activity = require('../models').activity;
const ActivityBudget = require('../models').activity_budget;
const StrategicGoal = require('../models').strategic_goal;
const ActivityGoalToStrategicGoal = require('../models').strategic_goal_to_activity_goal;
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
	if (formatFromDate2) {
		whereGoals.from_date = formatFromDate2[2] + "-" + formatFromDate2[1] + "-" + formatFromDate2[0];
	}
	if (formatToDate2) {
		whereGoals.to_date = formatToDate2[2] + "-" + formatToDate2[1] + "-" + formatToDate2[0];
	}
	whereGoals.firm_id = req.user.firm_id;
	if (req.user.role_id != 2) {
		whereGoals.user_id = req.user.id;
	}
	ActivityGoal.belongsTo(Firm, { foreignKey: 'firm_id' });
	ActivityGoal.hasMany(ActivityBudget, { foreignKey: 'activity_goal_id' });
	ActivityGoal.hasMany(Activity, {
		foreignKey: 'activity_goal_id'
	});
	ActivityGoal.findAll({
		where: whereGoals,
		include: [{
			model: Firm
		}, {
			model: Activity
		}, {
			model: ActivityBudget
		}]
	}).then(goals => {
		res.render('activity_goal/index', {
			layout: 'dashboard',
			title: 'Tactical Marketing Goals',
			success_message: success_message,
			success_edit_message: success_edit_message,
			success_del_message: success_del_message,
			goals: goals,
			from_activity_goal_date: req.query.from_activity_goal_date ? req.query.from_activity_goal_date : '',
			to_activity_goal_date: req.query.to_activity_goal_date ? req.query.to_activity_goal_date : ''
		});
	});
});

router.get('/activity-goal/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	const stragic_goal = await StrategicGoal.findAll({
		where:{
			firm_id: req.user.firm_id,
			user_id: req.user.id
		}
	})
	res.render('activity_goal/add', {
		layout: 'dashboard',
		title: 'Add Tactical Marketing Goal',
		csrfToken: req.csrfToken(),
		stragic_goal
	});
});

router.post('/activity-goal/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	var strategic_goal = req.body.strategic_goal;
	const formatFromDate = req.body.from_date ? req.body.from_date.split("-") : '';
	const formatToDate = req.body.to_date ? req.body.to_date.split("-") : '';
	var activity_goal_id = await ActivityGoal.create({
		firm_id: req.user.firm_id,
		user_id: req.user.id,
		activity_goal: req.body.activity_goal,
		//strategic_goal_id: req.body.strategic_goal,
		from_date: formatFromDate ? formatFromDate[2] + "-" + formatFromDate[0] + "-" + formatFromDate[1] : null,
		to_date: formatToDate ? formatToDate[2] + "-" + formatToDate[0] + "-" + formatToDate[1] : null,
		remarks: req.body.remarks
	});
	for (var i = 0; i < strategic_goal.length; i++)
	{
		ActivityGoalToStrategicGoal.create({
			activity_goal_id: activity_goal_id.id,
			strategic_goal_id: strategic_goal[i]
		});
	}
	req.flash('success-activityGoal-message', 'Activity Goal Created Successfully');
	res.redirect('/activity-goal');
});

router.get('/activity-goal/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	const edit_goals = await ActivityGoal.findById(req.params['id']);
	const stragic_goal = await StrategicGoal.findAll({
		where: {
			firm_id: req.user.firm_id,
			user_id: req.user.id
		}
	});
	var strategicGoal = await ActivityGoalToStrategicGoal.findAll({
		where: {
			activity_goal_id: req.params['id']
		}
	});
	var strategicGoalArr = [];
	for (var i = 0; i < strategicGoal.length; i++)
	{
		strategicGoalArr.push(strategicGoal[i].strategic_goal_id);
	}
	res.render('activity_goal/edit', {
		layout: 'dashboard',
		title: 'Edit Tactical Marketing Goal',
		csrfToken: req.csrfToken(),
		edit_goals,
		stragic_goal,
		strategicGoalArr
	})

});

router.get('/activity-goal/view/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	const edit_goals = await ActivityGoal.findById(req.params['id']);
	const stragic_goal = await StrategicGoal.findAll({
		where: {
			firm_id: req.user.firm_id,
			user_id: req.user.id
		}
	});
	var strategicGoal = await ActivityGoalToStrategicGoal.findAll({
		where: {
			activity_goal_id: req.params['id']
		}
	});
	var strategicGoalArr = [];
	for (var i = 0; i < strategicGoal.length; i++) {
		strategicGoalArr.push(strategicGoal[i].strategic_goal_id);
	}
	res.render('activity_goal/view', {
		layout: 'dashboard',
		title: 'View Tactical Marketing Goal',
		csrfToken: req.csrfToken(),
		edit_goals,
		stragic_goal,
		strategicGoalArr
	})

});

router.post('/activity-goal/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	var strategic_goal = req.body.strategic_goal;
	const formatFromDate1 = req.body.from_date ? req.body.from_date.split("-") : '';
	const formatToDate1 = req.body.to_date ? req.body.to_date.split("-") : '';
	ActivityGoal.update({
		activity_goal: req.body.activity_goal,
		strategic_goal_id: req.body.strategic_goal,
		from_date: formatFromDate1 ? formatFromDate1[2] + "-" + formatFromDate1[0] + "-" + formatFromDate1[1] : null,
		to_date: formatToDate1 ? formatToDate1[2] + "-" + formatToDate1[0] + "-" + formatToDate1[1] : null,
		remarks: req.body.remarks
	}, {
		where: {
			id: req.params['id']
		}
	});
	await ActivityGoalToStrategicGoal.destroy({
		where: {
			activity_goal_id: req.params['id']
		}
	})
	for (var i = 0; i < strategic_goal.length; i++)
	{
		ActivityGoalToStrategicGoal.create({
			activity_goal_id: req.params['id'],
			strategic_goal_id: strategic_goal[i]
		});
	}
	req.flash('success-edit-goal-message', 'Activity Goal Updated Successfully');
	res.redirect('/activity-goal');
});

router.get('/activity-goal/delete/:id', auth, firmAttrAuth, csrfProtection, (req, res) => {
	ActivityGoal.destroy({
		where: {
			id: req.params['id']
		}
	}).then(() => {
		req.flash('success-delete-goal-message', 'Activity Goal Deleted Successfully');
		res.redirect('/activity-goal');
	});
});

router.get("/activity-goal/view-activity/:id", auth, firmAttrAuth, async(req, res)=> {
	const activity = await Activity.findAll({
		where: {
			activity_goal_id : req.params['id']
		}
	});
	res.render('activity_goal/activity_list', {
		layout: 'dashboard',
		title: 'View Activity Listing',
		activity
	})
});

/*==================================Bratin Meheta 15-06-2018===================================*/

module.exports = router;
