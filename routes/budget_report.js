const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const Sequelize = require('sequelize');
const lodash = require("lodash");
const Activity = require('../models').activity;
const ActivityGoal = require('../models').activity_goal;
const Budget = require('../models').budget;
const ActivityBudget = require('../models').activity_budget;
const Jointactivities = require('../models').jointactivity;
const client = require('../models').client;
const Target = require('../models').target;
const Referral = require('../models').referral;
const User = require('../models').user;


var csrfProtection = csrf({
  cookie: true
});

const router = express.Router();

router.get('/activity-budget-report', auth, csrfProtection, async (req, res) => {
  // if (req.user.role_id == 2) {
  //   var firm_id = req.user.firm_id;
  //   var activity_goals = await ActivityGoal.findAll({
  //     where: {
  //       firm_id: firm_id
  //     }
  //   });
  // } else {
  //   var user_id = req.user.id;
  //   var activity_goals = await ActivityGoal.findAll({
  //     where: {
  //       user_id: user_id
  //     }
  //   });
  // }

  var firm_id = req.user.firm_id;
    var activity_goals = await ActivityGoal.findAll({
      where: {
        firm_id: firm_id,
        user_id:req.user.id
      }
    });

  var activityArr = [];
  var budgetArr = [];
  var activity_goal_total = [];
  var activity_goal_grand_total = [];
  var success;
  var activity_goal_arr = [];

  if (activity_goals.length > 0) {

    for (var a = 0; a < activity_goals.length; a++) {
      activity_goal_arr.push(activity_goals[a].id);
    }

    const budgetList = await Budget.findAll();

    for (var i = 0; i < budgetList.length; i++) {
      if (budgetList[i].parent_id === 0) {
        const parent_name = budgetList[i].name;
        const parent_id = budgetList[i].id;

        const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);

        var child_budget_arr = [];
        ActivityBudget.belongsTo(Activity, {
          foreignKey: 'activity_id'
        });
        for (var j = 0; j < child_budget.length; j++) {
          const activity_budget = await ActivityBudget.findAll({
            attributes: ['budget_id', 'activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
              [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
            ],
            group: ['budget_id', 'activity_goal_id']
          });

          const temp_arr = lodash.filter(activity_budget, arr => arr.budget_id === child_budget[j].id);

          const budget_wise_sum = await ActivityBudget.findAll({
            where: {
              'budget_id': child_budget[j].id,
              'activity_goal_id': {
                in: activity_goal_arr
              }
            },
            attributes: ['budget_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
              [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
            ],
            group: ['budget_id']
          });

          const hour = budget_wise_sum.length > 0 ? budget_wise_sum[0].hour : "-";
          const amount = budget_wise_sum.length > 0 ? budget_wise_sum[0].amount : "-";

          child_budget_arr.push({
            "id": child_budget[j].id,
            "name": child_budget[j].name,
            "budget_display": temp_arr,
            "parent_id": parent_id,
            "budget_sum": budget_wise_sum,
            "amount": amount,
            "hour": hour
          });
        }

        budgetArr.push({
          "parent_name": parent_name,
          "parent_id": parent_id,
          "child_budget": child_budget_arr
        });
      }
    }

    activity_goal_total = await ActivityBudget.findAll({
      attributes: ['activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
        [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
      ],
      group: ['activity_goal_id']
    });

    activity_goal_grand_total = await ActivityBudget.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
        [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
      ],
      where: {
        'activity_goal_id': {
          in: activity_goal_arr
        }
      }
    });

    for (var j = 0; j < activity_goals.length; j++) {
      activityArr.push({
        "activity_name": activity_goals[j].activity_goal,
        "activity_goal_id": activity_goals[j].id,
        "budget_list": budgetArr,
        "activity_goal_total": activity_goal_total,
        "activity_id": activity_goals[j].id
      });
    }
    success = 1;
  } else {
    success = 0;
  }

  res.render('activity_budget_report/index', {
    layout: 'dashboard',
    title: 'Activity Budget Listing',
    activityArr,
    budgetArr,
    activity_goal_grand_total: activity_goal_grand_total.length > 0 ? activity_goal_grand_total[0] : 0,
    success: success
  });
});

router.get('/budget-report/activity-goal/:id', auth, csrfProtection, async (req, res) => {

  var user_id = req.user.id;

  Activity.hasMany(ActivityBudget, {
    foreignKey: 'activity_id'
  });

  Activity.belongsTo(User, {
    foreignKey: 'user_id'
  });

  var activity_data = await Activity.findAll({
    where: {
      activity_goal_id: req.params['id']
    },
    include: [{
      model: ActivityBudget
    },{ model: User }]
  });
  const budgetList = await Budget.findAll();

  var activityArr = [];

  var budgetArr = [];
  for (var i = 0; i < budgetList.length; i++) {
    if (budgetList[i].parent_id === 0) {
      const parent_name = budgetList[i].name;
      const parent_id = budgetList[i].id;
      const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);
      var child_budget_arr = [];
      ActivityBudget.belongsTo(Activity, {
        foreignKey: 'activity_id'
      });
      for (var j = 0; j < child_budget.length; j++) {

        const activity_budget = await ActivityBudget.findAll({
          attributes: ['budget_id', 'activity_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
            [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
          ],
          group: ['budget_id', 'activity_id']
        });
        var temp_arr = lodash.filter(activity_budget, arr => arr.budget_id === child_budget[j].id);

        const budget_wise_sum = await ActivityBudget.findAll({
          where: {
            budget_id: child_budget[j].id,
            activity_goal_id: req.params['id']
          },
          attributes: ['budget_id', 'activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
            [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
          ],
          group: ['budget_id', 'activity_goal_id']
        });

        const hour = budget_wise_sum.length > 0 ? budget_wise_sum[0].hour : "-";
        const amount = budget_wise_sum.length > 0 ? budget_wise_sum[0].amount : "-";

        child_budget_arr.push({
          "id": child_budget[j].id,
          "name": child_budget[j].name,
          "budget_display": temp_arr,
          "parent_id": parent_id,
          "budget_sum": budget_wise_sum,
          "hour": hour,
          "amount": amount
        });
      }

      budgetArr.push({
        "parent_name": parent_name,
        "parent_id": parent_id,
        "child_budget": child_budget_arr
      });

    }
  }
  const activity_grand = await ActivityBudget.findAll({
    where: {
      activity_goal_id: req.params['id']
    },
    attributes: ['activity_id', 'activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
      [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
    ],
    group: ['activity_id', 'activity_goal_id']
  });

  const activity_budget_grand = await ActivityBudget.findAll({
    where: {
      activity_goal_id: req.params['id']
    },
    attributes: ['activity_goal_id', [Sequelize.fn('sum', Sequelize.col('hour')), 'hour'],
      [Sequelize.fn('sum', Sequelize.col('amount')), 'amount']
    ],
    group: ['activity_goal_id']
  });

  var jointActivities_arr = [];
  var jointActivities;
  for (var a = 0; a < activity_data.length; a++) {
    const _activityBudget = await ActivityBudget.findAll({
      where: {
        activity_id: activity_data[a].id
      }
    });

    jointActivities = await Jointactivities.findAll({
      where: {
        'activity_id': activity_data[a].id
      }
    });

    jointActivities_arr.push({
      'ja': jointActivities
    });

    activityArr.push({
      "activity_name": activity_data[a].activity_name,
      "activity_id": activity_data[a].id,
      "budget_list": budgetArr,
      "activity_grand": activity_grand,
      'originAttorney': activity_data[a].user.first_name + ' ' + activity_data[a].user.last_name,
      'activity_level': _activityBudget[0].level_type === 'Individual' ? 'I' : 'E'
    });
  }

  var activity_target_client = [];
  for (let i = 0; i < jointActivities_arr.length; i++) {
    for (let k = 0; k < jointActivities_arr[i].ja.length; k++) {
      var detailsActivity;
      if (jointActivities_arr[i].ja[k].target_client_type == 'T') {
        detailsActivity = await Target.findAll({
          where: {
            'id': jointActivities_arr[i].ja[k].type
          }
        });
      } else if(jointActivities_arr[i].ja[k].target_client_type == 'C') {
        detailsActivity = await client.findAll({
          where: {
            'id': jointActivities_arr[i].ja[k].type
          }
        });
      } else {
        detailsActivity = await Referral.findAll({
          where: {
            'id': jointActivities_arr[i].ja[k].type
          }
        });
      }

      activity_target_client.push({
        'name':  detailsActivity.length>0? (detailsActivity[0].first_name + ' ' + detailsActivity[0].last_name):'',
        'activity_id': jointActivities_arr[i].ja[k].activity_id
      });
    }
  }

  const activity_goal = await ActivityGoal.findById(req.params['id']);

  res.render('activity_budget_report/activity_details', {
    layout: 'dashboard',
    title: 'Activity Details',
    activityArr,
    budgetArr,
    activity_goal,
    activity_budget_grand,
    activity_target_client: activity_target_client
  });

});

router.get('/activity/activity_details_budget/:id', auth, csrfProtection, async (req, res) => {

  var marketingBudget = [];
  var budgetArr = [];
  var detailsActivity;

  const budgetList = await Budget.findAll();  //budget list

  const jointActivities = await Jointactivities.findAll({
    where: { 'activity_id': req.params['id'] }
  });

  for (var i = 0; i < budgetList.length; i++) {
    if (budgetList[i].parent_id === 0) {
      const parent_name = budgetList[i].name;
      const parent_id = budgetList[i].id;
      const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);

      var child_budget_arr = [];
      ActivityBudget.belongsTo(Activity, {
        foreignKey: 'activity_id'
      });

      for (var j = 0; j < child_budget.length; j++) {

        const activity_budget = await ActivityBudget.findAll({
          where: { 
            'budget_id': child_budget[j].id,
            'activity_id': req.params['id']
          }
        });
     
        const hour = activity_budget.length > 0 ? activity_budget[0].hour : "-";
        const amount = activity_budget.length > 0 ? activity_budget[0].amount : "-";
        const level = activity_budget.length > 0 ? ((activity_budget[0].level_type === 'Individual') ? 'I' : 'E') : "-";

        child_budget_arr.push({
          "id": child_budget[j].id,
          "name": child_budget[j].name,
          "budget_sum": activity_budget,
          "level_type": level,
          "hour": hour,
          "amount": amount
        });
      }

      budgetArr.push({
        "parent_name": parent_name,
        "parent_id": parent_id,
        "child_budget": child_budget_arr
      });
    }
  }

  for (let i = 0; i < jointActivities.length; i++) {
    if (jointActivities[i].target_client_type == 'T') {
      detailsActivity = await Target.findAll({
        where: { 'id': jointActivities[i].type }
      });
    } else if (jointActivities[i].target_client_type == 'C') {
      detailsActivity = await client.findAll({
        where: { 'id': jointActivities[i].type }
      });
    } else {
      detailsActivity = await Referral.findAll({
        where: { 'id': jointActivities[i].type }
      });
    }

    marketingBudget.push({
      'name': detailsActivity.length > 0 ? (detailsActivity[0].first_name + " " + detailsActivity[0].last_name) : "",
      'budget_list': budgetArr
    });
  } 

  res.render('activity_budget_report/activity_budget_details', {
    layout: 'dashboard',
    title: 'Activity Budget Details Listing',
    marketingBudget,
    budgetArr
  });

});

module.exports = router;