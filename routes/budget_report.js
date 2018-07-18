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
const Activity = require('../models').activity;
const ActivityGoal = require('../models').activity_goal;
const Budget = require('../models').budget;
const ActivityBudget = require('../models').activity_budget;


var csrfProtection = csrf({
	cookie: true
});

const router = express.Router();

router.get('/activity-budget-report', auth, csrfProtection, async (req, res) => {
	var user_id = req.user.id;

	var activity_goals = await ActivityGoal.findAll({
		where: {
			user_id: user_id
		}
	});

	const budgetList = await Budget.findAll();

	var activityArr = [];

	var budgetArr = [];
	for (var i = 0; i < budgetList.length; i++) {
		if (budgetList[i].parent_id === 0) {
			const parent_name = budgetList[i].name;
			const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);
			var child_budget_arr = [];
			ActivityBudget.belongsTo(Activity, {
				foreignKey: 'activity_id'
			});
			for (var j = 0; j < child_budget.length; j++) {
				const activity_budget = await ActivityBudget.findAll({
				    attributes: ['budget_id', 'activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'], [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']],
				    group: ['budget_id', 'activity_goal_id']
				});

				console.log(activity_budget);
				const temp_arr = lodash.filter(activity_budget, arr => arr.budget_id === child_budget[j].id);

				child_budget_arr.push({
					"id": child_budget[j].id,
					"name": child_budget[j].name,
					"budget_display": temp_arr
				});
			}

			budgetArr.push({
				"parent_name": parent_name,
				"child_budget": child_budget_arr
			});
		}
	}

	for (var j = 0; j < activity_goals.length; j++) {
		activityArr.push({
			"activity_name": activity_goals[j].activity_goal,
			"activity_goal_id": activity_goals[j].id,
			"budget_list": budgetArr
		});
	}

	res.render('activity_budget_report/index', {
		layout: 'dashboard',
		activityArr,
		budgetArr
	});
});

router.get('/budget-report/activity-goal/:id', auth, csrfProtection, async (req, res) => {
	var user_id = req.user.id;
	Activity.hasMany(ActivityBudget, {
		foreignKey: 'activity_id'
	});
	var activity_data = await Activity.findAll({
		where: {
			activity_goal_id: req.params['id']
		},
		include: [{
			model: ActivityBudget
		}]
	});
	const budgetList = await Budget.findAll();

	var activityArr = [];

	var budgetArr = [];
	for (var i = 0; i < budgetList.length; i++) {
		if (budgetList[i].parent_id === 0) {
			const parent_name = budgetList[i].name;
			const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);
			var child_budget_arr = [];
			ActivityBudget.belongsTo(Activity, {
				foreignKey: 'activity_id'
			});
			for (var j = 0; j < child_budget.length; j++) {
				const activity_budget = await ActivityBudget.findAll({
					where: {
						budget_id: child_budget[j].id
					}
				});
				child_budget_arr.push({
					"id": child_budget[j].id,
					"name": child_budget[j].name,
				});
			}
			budgetArr.push({
				"parent_name": parent_name,
				"child_budget": child_budget_arr
			});
		}
	}
	for (var a = 0; a < activity_data.length; a++) {
		const activity_budget_data = await ActivityBudget.findAll({
			where: {
				activity_id: activity_data[a].id
			}
		});

		activityArr.push({
			"activity_name": activity_data[a].activity_name,
			"activity_id": activity_data[a].id,
			"budget_list": budgetArr
		});
	}
	res.render('activity_budget_report/activity_details', {
		layout: 'dashboard',
		activityArr,
		budgetArr
	});
});

module.exports = router;