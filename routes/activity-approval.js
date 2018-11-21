const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const ActivityGoal = require('../models').activity_goal;
const PracticeArea = require('../models').practicearea;
const Budget = require('../models').budget;
const User = require('../models').user;
const ActivityBudget = require('../models').activity_budget;
const Jointactivities = require('../models').jointactivity;
const lodash = require("lodash");
const requestApproval = require('../models').request_approval;
const activityAttorney = require('../models').activity_attorney;
const Revenue = require('../models').revenue;
const router = express.Router();
const Client = require('../models').client;
const notificationTable = require('../models').notificationTable;
var fs = require('fs');
var xlsx = require('node-xlsx');
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/activity-approvals', auth, async (req, res) => {

    requestApproval.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });

    const activityRequest = await requestApproval.findAll({
        where: {
            'approver_id': req.user.id,
        },
        include: [{
            model: Activity
        }],
    });
    res.render('activity-approvals/index', {
        layout: 'dashboard',
        title: 'Pending Activity Approval Listing',
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
    var act_remark = await ActivityBudget.findOne({
            where: {
                activity_id: req.params['id'],
                approver_remarks: {
                    [Op.ne]: ''
                }
            }
        });
        
    const activity = await Activity.findById(req.params['id']);
    const originAttr = await User.findById(activity.user_id);
    const activity_goal = await ActivityGoal.findById(activity.activity_goal_id);
    const practice_area = await PracticeArea.findById(activity.practice_area);
    requestApproval.belongsTo(User, {
        foreignKey: 'approver_id'
    });
    const responseApprls = await requestApproval.findAll({
        where:{
            activity_id: req.params['id']
        },
        include: [{
            model: User
        }],
        order: [
            ['approver_status', 'DESC']
        ]
    })
    const responseApprl = await requestApproval.findOne({
        where: {
            activity_id: req.params['id'],
            approver_id: req.user.id
        }
    })
    res.render('activity-approvals/approval_details', {
        layout: 'dashboard',
        title: 'View Activity Details for Approval',
        activity_id: aaa,
        budgetArr,
        activity,
        'tclength': jointActivities.length,
        act_remark: act_remark ? act_remark.approver_remarks: "",
        activity_goal: activity_goal.activity_goal,
        //practice_area: practice_area.name,
        origin_attr: originAttr.first_name + " " + originAttr.last_name,
        responseApprl,
        responseApprls
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
    var selectActivity = await Activity.findById(req.body.activity_id);
    await notificationTable.update({
        status: 1
    },{
        where: {
            link: "/approval_details/" + req.body.activity_id,
            activity_id: req.body.activity_id,
            activity_type_id: req.user.id
        }
    });
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

        
        await notificationTable.create({
            notification_details: selectActivity.activity_name + " has been rejected from approver. Please update this activity and resend for approval",
            activity_type_id: parseInt(selectActivity.user_id),
            sender_id: parseInt(req.user.id),
            activity_id: req.body.activity_id,
            status: 0,
            link: "/activity/edit/" + req.body.activity_id
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
            var findAppr = await requestApproval.findOne({
                where: {
                    'activity_id': req.body.activity_id,
                    'status': "1",
                    'approve': "0"
                }
            })
            const findActivity = await Activity.findById(req.body.activity_id);
            const findOrgAttr = await User.findById(findActivity.user_id)
            await notificationTable.create({
                notification_details: "Request for approval for " + findActivity.activity_name + " from " + findOrgAttr.first_name + " " + findOrgAttr.last_name + " on ",
                activity_type_id: parseInt(findAppr.approver_id),
                sender_id: parseInt(req.user.id),
                activity_id: req.body.activity_id,
                status: 0,
                link: "/approval_details/" + req.body.activity_id
            });

        } else {
            await Activity.update({
                activity_status: req.body.status
            }, {
                where: {
                    id: req.body.activity_id
                }
            });
            await notificationTable.create({
                notification_details: selectActivity.activity_name + " has been approved from approver",
                activity_type_id: parseInt(selectActivity.user_id),
                sender_id: parseInt(req.user.id),
                activity_id: req.body.activity_id,
                status: 0,
                link: "/activity/view/" + req.body.activity_id
            });
        }
    } 

    res.send({
        "success": true
    })
});

// router.post("/get-notification", auth, async (req, res) => {

//     var notiFicationDetails = []

//      requestApproval.belongsTo(Activity, {
//         foreignKey: 'activity_id'
//     });

//     requestApproval.belongsTo(User, {
//         foreignKey: 'approver_id'
//     });
    
//     const noti = await requestApproval.findAll({
//         where: {
//             'approver_id': req.user.id,
//             'status': '1'
//         },
//         include: [{
//             model: User
//         },
//         {
//             model: Activity
//         }],
//         order: [
//             ['updatedAt', 'DESC']
//         ]
//     });

//     activityAttorney.belongsTo(Activity, {
//         foreignKey: 'activity_id'
//     });

//     activityAttorney.belongsTo(User, {
//         foreignKey: 'attorney_id'
//     });
    
//     const teamActivityAttorney = await activityAttorney.findAll({
//         where: {
//             'attorney_id': req.user.id,
//             'status': '0',
//         },
//         include: [{
//             model: User
//         },{
//             model: Activity
//         }],
//     }); 


//     if (teamActivityAttorney.length>0) {
//         for (let i=0; i< teamActivityAttorney.length; i++) {
//             const userDetails = await User.findOne({
//                 where:{
//                     'id':teamActivityAttorney[i].activity.user_id
//                 }
//             })
            
//             notiFicationDetails.push({
//                 'name': teamActivityAttorney[i].activity.activity_name,
//                 'createDate':teamActivityAttorney[i].activity.activity_creation_date,
//                 'updateDate': teamActivityAttorney[i].activity.updatedAt,
//                 'updatedAt':teamActivityAttorney[i].updatedAt,
//                 'activity_id':teamActivityAttorney[i].activity.id,
//                 'userFirstName':userDetails.first_name,
//                 'userLastName':userDetails.last_name,
//                 'type': '1'
//             })
//         }
//     }
    
//     if (noti.length>0) {
//         for (let i=0; i< noti.length; i++) {
//             const userDetails = await User.findOne({
//                 where:{
//                     'id':noti[i].activity.user_id
//                 }
//             })

//             notiFicationDetails.push({
//                 'name':noti[i].activity.activity_name,
//                 'createDate':noti[i].activity.activity_creation_date,
//                 'updateDate': noti[i].activity.updatedAt,
//                 'updatedAt':noti[i].updatedAt,
//                 'activity_id':noti[i].activity.id,
//                 'userFirstName':userDetails.first_name,
//                 'userLastName':userDetails.last_name,
//                 'type':'2'
//             }) 
//         }
//     }


//     // get notification for plaining periode
//     const allRevenue = await Revenue.findAll({
//         where: {
//             'type':'C',
//             'user_id': req.user.id
//         }
//     });

//     const dateDetails = new Date();
//     for (let i=0; i<allRevenue.length; i++) {
//         if (dateDetails > allRevenue[i].end_date && allRevenue[i].status == 0) {
//            let clientDetails =  await Client.findById(allRevenue[i].client_id);
//             //   notiFicationDetails.push({
//             //     'name': clientDetails.first_name + " " + clientDetails.last_name,
//             //     'createDate':clientDetails.createdAt,
//             //     'updateDate': clientDetails.updatedAt,
//             //     'updatedAt':clientDetails.updatedAt,
//             //     'client_id':allRevenue[i].client_id,
//             //     'userFirstName':'userDetails.first_name',
//             //     'userLastName':'userDetails.last_name',
//             //     'type': '3'
//             // })  

//         }
//     }

//     res.send({
//         "success": true,
//         "count": notiFicationDetails.length,
//         "approval_noti": notiFicationDetails
//     });
// });

router.get("/get_notification-details", auth, async(req, res)=> {
    const noti = await notificationTable.findAll({
        where: {
            activity_type_id: req.user.id,
            approve_id: 1
        },
        order: [
            ['id', 'DESC']
        ],
    });
    const noti_count = await notificationTable.findAll({
        where: {
            activity_type_id: req.user.id,
            status: 0,
            approve_id: 1
        }
    });
    //console.log(noti_count.length);

    res.send({
        count: noti_count.length,
        noti: noti
    })
});

router.post("/change-read-status", auth, async(req, res)=> {
    const noti_update = await notificationTable.update({
        status: 1
    },{
        where: {
            id: req.body.noti_id
        }
    });
    res.send({
        success: true
    })
});

router.get("/end-planning-period-noti-crown", async(req, res)=> {
    const allRevenue = await Revenue.findAll({
        where: {
            'type':'C',
            'status': 0
        }
    });
    const dateDetails = new Date();
    for (var i=0; i<allRevenue.length; i++) {
        if (dateDetails > allRevenue[i].end_date) {
            var clientDetails =  await Client.findById(allRevenue[i].client_id);
            var clientName = clientDetails ? clientDetails.first_name + " " + clientDetails.last_name : '';
            await notificationTable.create({
                notification_details: "End planning Period for" + clientName + " on ",
                activity_type_id: parseInt(allRevenue[i].user_id),
                sender_id: 0,
                status: 0,
                link: "/client/edit/" + allRevenue[i].client_id
            });
        }
    }
    res.redirect("/dashboard");
})

// function convertToJSON(array) {
//     var first = array[0].join()
//     var headers = first.split(',');

//     var jsonData = [];
//     for (var i = 1, length = array.length; i < length; i++) {
//         var myRow = array[i].join();
//         var row = myRow.split(',');

//         var data = {};
//         for (var x = 0; x < row.length; x++) {
//             data[headers[x]] = row[x];
//         }
//         jsonData.push(data);
//     }
//     return jsonData;
// }

// function toTitleCase(str) {
//     return str.replace(/\w\S*/g, function (txt) {
//         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//     });
// }

// router.get("/uploads-xlxs-country-state", async(req, res)=> {
//     var xxx = xlsx.parse(fs.readFileSync('public/importstatecityfetch.xlsx'));
//     var importedData = JSON.stringify(convertToJSON(xxx[0].data));
//     var xxxo = JSON.parse(importedData);
//     //const loadArr = lodash.filter(xxxo, arr => arr.full_state === "Ohio");
//     for (var y = 0; y < xxxo.length; y++) {
//         if (xxxo[y].full_state == "Wyoming")
//         {
//             if (xxxo[y].city !== "NULL") {
//                 if (xxxo[y].city != xxxo[y + 1].city)
//                 {
//                     //console.log(xxxo[y].city);
//                     await City.create({
//                         state_id: "51",
//                         name: toTitleCase(xxxo[y].city)
//                     })
//                 }
//                 if (xxxo[y].zip != xxxo[y + 1].zip)
//                 {
//                     await Zipcode.create({
//                         zip: xxxo[y].zip,
//                         city_name: toTitleCase(xxxo[y].city),
//                         lat:xxxo[y].lat,
//                         lng:xxxo[y].long
//                     })
//                 }
//             }
//         }
//     }
//     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!============completed================!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
//     res.send("completed");
// })

module.exports = router;