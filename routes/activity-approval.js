const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const Budget = require('../models').budget;
const User = require('../models').user;
const ActivityBudget = require('../models').activity_budget;
const lodash = require("lodash");

const router = express.Router();

router.get('/activity-approvals', auth, async (req, res) => {
  
    const activity_approvals = await Activity.findAll({
       where: { 
           'activity_status': 1,
           'firm_id': req.user.firm_id
         }
    });

    res.render('activity-approvals/index', {
        layout: 'dashboard',
        activity_approvals: activity_approvals
	});
    
});

router.get('/approval_details/:id', auth, async (req, res) => {
  
    const budgetList = await Budget.findAll();
	var budgetArr = [];
	var level_type = '';
	for (var i = 0; i < budgetList.length; i++) {
		if (budgetList[i].parent_id === 0) {
			const parent_name = budgetList[i].name;
			const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);
			var child_budget_arr = [];
			for (var j = 0; j < child_budget.length; j++) {
				const activity_budget = await ActivityBudget.findAll({
					where: {
						budget_id: child_budget[j].id,
						activity_id: req.params['id']
					}
				});
				const hour = activity_budget.length > 0 ? activity_budget[0].hour : '';
                const amount = activity_budget.length > 0 ? activity_budget[0].amount : '';
                const remarks = activity_budget.length > 0 ? activity_budget[0].approver_remarks : '';
				child_budget_arr.push({
					"id": child_budget[j].id,
					"name": child_budget[j].name,
					"hour": hour,
                    "amount": amount,
                    "remarks": remarks
				});
			}
			budgetArr.push({
				"parent_name": parent_name,
				"child_budget": child_budget_arr
			});
		}
	}
    var aaa = req.params['id'];

    res.render('activity-approvals/approval_details', {
        layout: 'dashboard',
        activity_id: aaa,
        budgetArr
	});
    
});


router.post('/add_activity_budget_remark', auth, async (req, res) => {
    await ActivityBudget.update({
        approver_remarks: req.body.approver_remarks
    }, {
        where: {
            budget_id: req.body.budget_id,
            activity_id: req.body.activity_id
        }
    });
    res.send({
        "success": true
    })
});

router.post('/update_activity_approve_reject', auth, async (req, res) => {
    await Activity.update({
        activity_status: req.body.status
    }, {
        where: {
            id: req.body.activity_id
        }
    });
    res.send({
        "success": true
    })
});

router.post("/get-notification", auth, async(req, res)=> {
    Activity.belongsTo(User, {
        foreignKey: 'user_id'
    });
    const noti = await Activity.findAll({
        where: {
            firm_id : req.user.firm_id,
            activity_status: 1
        },
        include: [{
            model: User
        }],
        order: [['updatedAt', 'DESC']]
    });
    res.send({
        "success": true,
        "count": noti.length,
        "approval_noti" : noti
    });
});

module.exports = router;