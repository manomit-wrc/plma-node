const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const Budget = require('../models').budget;
const User = require('../models').user;
const ActivityBudget = require('../models').activity_budget;
const Jointactivities = require('../models').jointactivity;
const lodash = require("lodash");
const requestApproval = require('../models').request_approval;

const router = express.Router();

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/activity-approvals', auth, async (req, res) => {

    const activityRequest = await requestApproval.findAll({
        where: {
            'approver_id': req.user.id,
            'status': '1',
            'approve': '0'
        }
    });

    var activity_approvals;
    if (activityRequest.length > 0) {
        for (let i=0; i< activityRequest.length; i++) {
            activity_approvals = await Activity.findAll({
                where: {
                    // 'activity_status': 1,
                    // 'firm_id': req.user.firm_id
                    id:activityRequest[i].activity_id
                }
            });

        }
    }

    res.render('activity-approvals/index', {
        layout: 'dashboard',
        activity_approvals: activity_approvals
    });
});

router.get('/approval_details/:id', auth, async (req, res) => {

    const budgetList = await Budget.findAll();

    const jointActivities = await Jointactivities.findAll({
        where: {
            'activity_id': req.params['id']
        }
    });

    var budgetArr = [];
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
                const level = activity_budget.length > 0 ? ((activity_budget[0].level_type === 'Individual') ? 'I' : 'E') : '';
                child_budget_arr.push({
                    "id": child_budget[j].id,
                    "name": child_budget[j].name,
                    "hour": hour,
                    "amount": amount,
                    "level_type": level,
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
        budgetArr,
        'tclength': jointActivities.length
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

     if (req.body.status==3){
        await requestApproval.update({
            'approve': '0',
            'status': '2',
        }, {
            where: {
                'approver_id': req.user.id,
                'activity_id': req.body.activity_id
            }
        })

        await Activity.update({
            activity_status: req.body.status
        }, {
            where: {
                id: req.body.activity_id
            }
        });

    } else {
        await requestApproval.update({
            'approve': '1',
            'status': '0'
        }, {
            where: {
                'approver_id': req.user.id,
                'activity_id': req.body.activity_id
            }
        })
    
        const _activityApprovals = await requestApproval.findOne({
            attributes: [
                [Sequelize.fn('MAX', Sequelize.col('approver_status')), 'max_approver_status']
            ],
            where: {
                'activity_id': req.body.activity_id,
                'approve': '0'
            }
        });
    
        if (_activityApprovals.get('max_approver_status') !== null) {
            await requestApproval.update({
                'status': '1'
            }, {
                where: {
                    'activity_id': req.body.activity_id,
                    'approver_status': _activityApprovals.get('max_approver_status')
                }
            });
        } else {
            await Activity.update({
                activity_status: req.body.status
            }, {
                where: {
                    id: req.body.activity_id
                }
            });
        }
    } 

    res.send({
        "success": true
    })
});

router.post("/get-notification", auth, async (req, res) => {

     requestApproval.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });

    requestApproval.belongsTo(User, {
        foreignKey: 'approver_id'
    });
    
    const noti = await requestApproval.findAll({
        where: {
            'approver_id': req.user.id,
            'status': '1'
        },
        include: [{
            model: User
        },
        {
            model: Activity
        }],
        order: [
            ['updatedAt', 'DESC']
        ]
    });

    res.send({
        "success": true,
        "count": noti.length,
        "approval_noti": noti
    });
});

module.exports = router;