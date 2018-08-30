const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const Budget = require('../models').budget;
const User = require('../models').user;
const ActivityBudget = require('../models').activity_budget;
const Jointactivities = require('../models').jointactivity;
const lodash = require("lodash");
const requestApproval = require('../models').request_approval;
const activityAttorney = require('../models').activity_attorney;

const router = express.Router();

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/activity-approvals', auth, async (req, res) => {

    requestApproval.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });

    const activityRequest = await requestApproval.findAll({
        where: {
            'approver_id': req.user.id,
            'status': '1',
            'approve': '0'
        },
        include: [{
            model: Activity
        }],
    });
    
    res.render('activity-approvals/index', {
        layout: 'dashboard',
        activity_approvals: activityRequest
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
            'activity_status': req.body.status,
            'activity_update': 'new'
        }, {
            where: {
                'id': req.body.activity_id
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

    var notiFicationDetails = []

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


    activityAttorney.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });

    activityAttorney.belongsTo(User, {
        foreignKey: 'attorney_id'
    });
    
    const teamActivityAttorney = await activityAttorney.findAll({
        where: {
            'attorney_id': req.user.id,
            'status': '0',
        },
        include: [{
            model: User
        },{
            model: Activity
        }],
    }); 


    if (teamActivityAttorney.length>0) {
        for (let i=0; i< teamActivityAttorney.length; i++) {
            notiFicationDetails.push({
                'name': teamActivityAttorney[i].activity.activity_name,
                'createDate':teamActivityAttorney[i].activity.activity_creation_date,
                'updateDate': teamActivityAttorney[i].activity.updatedAt,
                'updateAt':teamActivityAttorney[i].updatedAt,
                'activity_id':teamActivityAttorney[i].activity.id,
                'userFirstName':teamActivityAttorney[i].user.first_name,
                'userLastName':teamActivityAttorney[i].user.last_name
            })
        }
    }

    if (noti.length>0) {
        for (let i=0; i< noti.length; i++) {
            notiFicationDetails.push({
                'name':noti[i].activity.activity_name,
                'createDate':noti[i].activity.activity_creation_date,
                'updateDate': noti[i].activity.updatedAt,
                'updateAt':noti[i].updatedAt,
                'activity_id':noti[i].activity.id,
                'userFirstName':noti[i].user.first_name,
                'userLastName':noti[i].user.last_name
            }) 
        }
    }

    
 
    res.send({
        "success": true,
        "count": notiFicationDetails.length,
        "approval_noti": notiFicationDetails
    });
});

module.exports = router;