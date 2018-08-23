const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const Section = require('../models').section;
const Activity = require('../models').activity;
const Activity_to_user_type = require('../models').jointactivity;
const lodash = require("lodash");
const router = express.Router();
const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;
const PracticeArea = require('../models').practicearea;
const Target = require('../models').target;
const Client = require('../models').client;
const Budget = require('../models').budget;
const ActivityBudget = require('../models').activity_budget;
const sectionToFirm = require('../models').section_to_firms;
const Referral = require('../models').referral;
const multer = require('multer');
const User = require('../models').user;
const requestApproval = require('../models').request_approval;
var fileName = '';

// File upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/activity');
    },
    filename: function (req, file, cb) {
        fileExt = file.originalname.split('.')[1];
        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});

var upload = multer({
    storage: storage
});

var csrfProtection = csrf({
    cookie: true
});

function removePhoneMask(removeCharacter) {
    removeCharacter = removeCharacter.replace("-", "");
    removeCharacter = removeCharacter.replace(")", "");
    removeCharacter = removeCharacter.replace("(", "");
    removeCharacter = removeCharacter.replace("$", "");
    removeCharacter = removeCharacter.replace(",", "");
    removeCharacter = removeCharacter.replace(" ", "");
    return removeCharacter;
}

router.get('/activityseen', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    var activityFilter = {};
    if (req.query.searchActive) {
        activityFilter.activity_type = req.query.searchActive;
    }

    var success_message = req.flash('success-activity-message')[0];

    const firm = await Firm.findAll({
        where: {
            id: req.user.firm_id
        }
    });

    sectionToFirm.belongsTo(Section, {
        foreignKey: 'section_id'
    });

    const allSection = await sectionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{
            model: Section
        }]
    });

    const activity_goal = await ActivityGoal.findAll({
        where: {
            'firm_id': req.user.firm_id
        }
    });
    const practice_area = await PracticeArea.findAll();

    const target = await Target.findAll({
        where: {
            'target_type': "I",
            'target_status': '1',
            'attorney_id': req.user.id
        }
    });

    const client = await Client.findAll({
        where: {
            'client_type': "I",
            'attorney_id': req.user.id
        }
    });

    const referral = await Referral.findAll({
        where: {
            'firm_id': req.user.firm_id,
            'attorney_id': req.user.id
        }
    });

    const budgetList = await Budget.findAll();

    var budgetArr = [];
    for (var i = 0; i < budgetList.length; i++) {
        if (budgetList[i].parent_id === 0) {
            const parent_name = budgetList[i].name;
            const child_budget = lodash.filter(budgetList, arr => arr.parent_id === budgetList[i].id);
            budgetArr.push({
                "parent_name": parent_name,
                "child_budget": child_budget
            });
        }
    }

    res.render('activity/addactivity', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        firm: firm[0].title,
        section: allSection,
        originAttorney: req.user.first_name + " " + req.user.last_name,
        success_message,
        activity_goal: activity_goal,
        practice_area: practice_area,
        client: client,
        target: target,
        referral,
        budgetArr
    });
});

//fetch

router.get('/activitypage', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    var whereCondition = {};

    if (req.query.activity_goal_id) {
        whereCondition.activity_goal_id = req.query.activity_goal_id;
    }
    if (req.query.activity_type) {
        whereCondition.activity_type = req.query.activity_type;
    }
    if (req.query.approval_status) {
        whereCondition.activity_status = req.query.approval_status;
    }
    if (req.query.ref_type && req.query.target_user || req.query.client_user || req.query.referral_user) {
        var acti_user = '';
        if (req.query.target_user) {
            acti_user = req.query.target_user
        } else if (req.query.client_user) {
            acti_user = req.query.client_user
        } else if (req.query.referral_user) {
            acti_user = req.query.referral_user
        }
        const activity_user = await Activity_to_user_type.findAll({
            where: {
                'target_client_type': req.query.ref_type,
                'type': acti_user
            }
        });
        var actiArr = [];
        for (var i = 0; i < activity_user.length; i++) {
            actiArr.push(activity_user[i].activity_id);
        }
        whereCondition.id = actiArr;
    }
    if (req.user.role_id == 2) {
        whereCondition.firm_id = req.user.firm_id;
    } else {
        whereCondition.firm_id = req.user.firm_id;
        whereCondition.user_id = req.user.id;
    }
    var success_message = req.flash('success-message')[0];
    const activity_goal = await ActivityGoal.findAll({
        where: {
            'firm_id': req.user.firm_id
        }
    });

    const target = await Target.findAll({
        where: {
            'target_type': "I",
            'target_status': '1',
            'attorney_id': req.user.id
        }
    });

    const client = await Client.findAll({
        where: {
            'client_type': "I",
            'attorney_id': req.user.id
        }
    });

    const referral = await Referral.findAll({
        where: {
            'firm_id': req.user.firm_id,
            'attorney_id': req.user.id
        }
    });

    var activity = await Activity.findAll({
        where: whereCondition,
    });

    res.render('activity/activity', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        row: activity,
        success_message,
        activity_goal,
        target,
        client,
        referral,
        activity_goal_id: req.query.activity_goal_id ? req.query.activity_goal_id : "",
        activity_type: req.query.activity_type ? req.query.activity_type : "",
        refer_type: req.query.ref_type ? req.query.ref_type : "",
        user_target: req.query.target_user ? req.query.target_user : "",
        user_client: req.query.client_user ? req.query.client_user : "",
        user_referral: req.query.referral_user ? req.query.referral_user : "",
        approval_status: req.query.approval_status ? req.query.approval_status : "",
        count_query: Object.keys(req.query).length
    });
});

// Start budget add section

router.post('/insertActivity', auth, async (req, res) => {
    const addActivityId = await Activity.create({
        activity_name: req.body.activityName
    });
    res.json({
        success: true,
        activityId: addActivityId.id
    });
});

router.post('/activity/add-budget', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    var budget = JSON.parse(req.body.budget);

    for (var b = 0; b < budget.length; b++) {
        await ActivityBudget.create({
            activity_id: req.body.activity_id,
            activity_goal_id: req.body.activity_goal,
            level_type: req.body.activity_level_type,
            budget_id: budget[b].budget_id,
            hour: budget[b].budget_hour,
            amount: budget[b].budget_amount,
        });
    }
    res.json({
        success: true
    });
})

// ========{{  insert data to the database  }}=====================//

router.post('/activity/add', auth, upload.single('activity_attachment'), firmAttrAuth, csrfProtection, async (req, res) => {
    var target_user = [];
    var client_user = [];
    var referral_user = [];

    target_user = req.body.target_user;
    client_user = req.body.client_user;
    referral_user = req.body.referral_user;

    const CreationDate = req.body.activity_creation_date ? req.body.activity_creation_date.split("-") : '';
    const FromDate = req.body.activity_from_date ? req.body.activity_from_date.split("-") : '';
    const ToDate = req.body.activity_to_date ? req.body.activity_to_date.split("-") : '';

    const activityBudgetData = await ActivityBudget.findAll({
        where: {
            'activity_id': req.body.activity_id
        }
    })

    var targetClientLength = 1;
    if (activityBudgetData[0].level_type === 'Individual') {
        if (target_user !== undefined) {
            targetClientLength = target_user.length;
        }
        if (client_user !== undefined) {
            targetClientLength = client_user.length;
        }
        if (referral_user !== undefined) {
            targetClientLength = referral_user.length;
        }

        for (var b = 0; b < activityBudgetData.length; b++) {
            var totalHour = targetClientLength * activityBudgetData[b].hour;
            var totalAmount = targetClientLength * activityBudgetData[b].amount;
            await ActivityBudget.update({
                hour: totalHour,
                amount: totalAmount
            }, {
                where: {
                    'activity_id': req.body.activity_id,
                    'budget_id': activityBudgetData[b].budget_id
                }
            });
        }
    }

    await Activity.update({
        firm: req.body.firm,
        activity_type: req.body.activity_type,
        activity_goal_id: req.body.activity_goal,
        practice_area: req.body.practice_area,
        remarks: req.body.remarks,
        activity_creation_date: CreationDate ? CreationDate[2] + "-" + CreationDate[1] + "-" + CreationDate[0] : null,
        activity_from_date: FromDate ? FromDate[2] + "-" + FromDate[1] + "-" + FromDate[0] : null,
        activity_to_date: ToDate ? ToDate[2] + "-" + ToDate[1] + "-" + ToDate[0] : null,
        activity_name: req.body.activity_name,
        activity_reason: req.body.activity_reason,
        budget_status: req.body.budget_status,
        budget_details_status: req.body.budget_details_status,
        target: req.body.ref_type,
        user_id: req.user.id,
        firm_id: req.user.firm_id,
        total_budget_hour: req.body.total_hour,
        total_budget_amount: req.body.total_amount,
        section_id: req.body.section,
        s_group_id: req.body.strategy_group,
        attachment_field: fileName
    }, {
        where: {
            id: req.body.activity_id
        }
    });

    if (req.body.ref_type == "T") {
        for (var i = 0; i < target_user.length; i++) {
            await Activity_to_user_type.create({
                activity_id: req.body.activity_id,
                target_client_type: req.body.ref_type,
                type: target_user[i]
            });
        }
    } else if (req.body.ref_type == 'C') {
        for (var j = 0; j < client_user.length; j++) {
            await Activity_to_user_type.create({
                activity_id: req.body.activity_id,
                target_client_type: req.body.ref_type,
                type: client_user[j]
            });
        }
    } else if (req.body.ref_type == 'R') {
        for (var r = 0; r < referral_user.length; r++) {
            await Activity_to_user_type.create({
                activity_id: req.body.activity_id,
                target_client_type: req.body.ref_type,
                type: referral_user[r]
            });
        }
    }

    req.flash('success-activity-message', 'Activity Created Successfully');
    res.redirect('/activitypage');
});

router.get('/activity/view/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    Activity.hasMany(Activity_to_user_type, {
        foreignKey: 'activity_id'
    });

    const firm = await Firm.findAll({
        where: {
            id: req.user.firm_id
        }
    });

    const activity_goal = await ActivityGoal.findAll({
        where: {
            'firm_id': req.user.firm_id
        }
    });
    const practice_area = await PracticeArea.findAll();

    const target = await Target.findAll({
        where: {
            'target_type': "I",
            'attorney_id': req.user.id
        }
    });
    const client = await Client.findAll({
        where: {
            'client_type': "I",
            'attorney_id': req.user.id
        }
    });

    const referral = await Referral.findAll({
        where: {
            'attorney_id': req.user.id
        }
    });

    const editdata = await Activity.findAll({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Activity_to_user_type
        }]
    });
    var result = JSON.parse(JSON.stringify(editdata[0].jointactivities));
    var arr = [];
    for (var i = 0; i < result.length; i++) {
        arr.push(parseInt(result[i].type));
    }
    const budgetList = await Budget.findAll({});
    var budgetArr = [];
    var level_type = '';

    const all_activity_client = await Activity_to_user_type.findAll({
        where: {
            'activity_id': editdata[0].id
        }
    });

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
                level_type = activity_budget.length > 0 ? activity_budget[0].level_type : level_type;

                const hour = activity_budget.length > 0 ? ((level_type === 'Individual') ? activity_budget[0].hour / all_activity_client.length : activity_budget[0].hour) : '';
                const amount = activity_budget.length > 0 ? ((level_type === 'Individual') ? activity_budget[0].amount / all_activity_client.length : activity_budget[0].amount) : '';
                const approval_remarks = activity_budget.length > 0 ? activity_budget[0].approver_remarks : '';

                child_budget_arr.push({
                    "id": child_budget[j].id,
                    "name": child_budget[j].name,
                    "hour": hour,
                    "amount": amount,
                    "remarks": approval_remarks
                });
            }
            budgetArr.push({
                "parent_name": parent_name,
                "child_budget": child_budget_arr
            });
        }
    }

    var alldata = [];
    var target_client_list;

    const activity_budget = await ActivityBudget.findOne({
        where: {
            activity_id: req.params['id']
        }
    });

    for (let i = 0; i < all_activity_client.length; i++) {
        if (all_activity_client[i].target_client_type == 'C') {
            target_client_list = await Client.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            })
        } else if (all_activity_client[i].target_client_type == 'T') {
            target_client_list = await Target.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            })
        } else {
            target_client_list = await Referral.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            });
        }
        alldata.push({
            'attorney_name': req.user.first_name + " " + req.user.last_name,
            'company_name': target_client_list.length > 0 ? (target_client_list[0].first_name + " " + target_client_list[0].last_name) : "",
            'relation': all_activity_client[i].target_client_type,
            'total_cost': activity_budget.level_type == 'Individual' ? editdata[0].total_budget_amount : parseFloat(editdata[0].total_budget_amount / all_activity_client.length),
            'potential_revenue': activity_budget.level_type == 'Individual' ? editdata[0].potiential_revenue : parseFloat(editdata[0].potiential_revenue / all_activity_client.length)
        });
    }

    sectionToFirm.belongsTo(Section, {
        foreignKey: 'section_id'
    });

    const allSection = await sectionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{
            model: Section
        }]
    });

    res.render('activity/view_activity', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        client: client,
        target: target,
        referral,
        arr,
        alltarget_client: alldata,
        editdata: editdata[0],
        firm: firm[0].title,
        originAttorney: req.user.first_name + " " + req.user.last_name,
        activity_goal: activity_goal,
        budgetArr,
        practice_area: practice_area,
        level_type,
        section: allSection
    });
});

//.....................{{   edit data  }}.......................................//

router.get('/activity/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    Activity.hasMany(Activity_to_user_type, {
        foreignKey: 'activity_id'
    });
    const firm = await Firm.findAll({
        where: {
            id: req.user.firm_id
        }
    });
    const activity_goal = await ActivityGoal.findAll({
        where: {
            'firm_id': req.user.firm_id
        }
    });
    const practice_area = await PracticeArea.findAll();

    const target = await Target.findAll({
        where: {
            'target_type': "I",
            'target_status': '1',
            'attorney_id': req.user.id
        }
    });

    const client = await Client.findAll({
        where: {
            'client_type': "I",
            'attorney_id': req.user.id
        }
    });

    const referral = await Referral.findAll({
        where: {
            'attorney_id': req.user.id
        }
    });

    const editdata = await Activity.findAll({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Activity_to_user_type
        }]
    });
    var result = JSON.parse(JSON.stringify(editdata[0].jointactivities));
    var arr = [];
    for (var i = 0; i < result.length; i++) {
        arr.push(parseInt(result[i].type));
    }
    const budgetList = await Budget.findAll();
    var budgetArr = [];
    var level_type = '';

    const all_activity_client = await Activity_to_user_type.findAll({
        where: {
            'activity_id': editdata[0].id
        }
    });

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

                level_type = activity_budget.length > 0 ? activity_budget[0].level_type : level_type;
                const hour = activity_budget.length > 0 ? ((level_type === 'Individual') ? activity_budget[0].hour / all_activity_client.length : activity_budget[0].hour) : '';
                const amount = activity_budget.length > 0 ? ((level_type === 'Individual') ? activity_budget[0].amount / all_activity_client.length : activity_budget[0].amount) : '';
                const approval_remarks = activity_budget.length > 0 ? activity_budget[0].approver_remarks : '';

                child_budget_arr.push({
                    "id": child_budget[j].id,
                    "name": child_budget[j].name,
                    "hour": hour,
                    "amount": amount,
                    "remarks": approval_remarks
                });
            }
            budgetArr.push({
                "parent_name": parent_name,
                "child_budget": child_budget_arr
            });
        }
    }

    var alldata = [];
    var target_client_list;

    const activity_budget = await ActivityBudget.findOne({
        where: {
            activity_id: req.params['id']
        }
    });

    for (let i = 0; i < all_activity_client.length; i++) {
        if (all_activity_client[i].target_client_type == 'C') {
            target_client_list = await Client.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            })
        } else if (all_activity_client[i].target_client_type == 'T') {
            target_client_list = await Target.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            })
        } else {
            target_client_list = await Referral.findAll({
                where: {
                    'id': all_activity_client[i].type
                }
            });
        }
        alldata.push({
            'attorney_name': req.user.first_name + " " + req.user.last_name,
            'company_name': target_client_list[0].first_name + " " + target_client_list[0].last_name,
            'relation': all_activity_client[i].target_client_type,
            'total_cost': activity_budget.level_type == 'Individual' ? editdata[0].total_budget_amount : parseFloat(editdata[0].total_budget_amount / all_activity_client.length),
            'potential_revenue': activity_budget.level_type == 'Individual' ? editdata[0].potiential_revenue : parseFloat(editdata[0].potiential_revenue / all_activity_client.length)
        });
    }

    sectionToFirm.belongsTo(Section, {
        foreignKey: 'section_id'
    });

    const allSection = await sectionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{
            model: Section
        }]
    });

    // req.flash('success-message', 'Activity update Successfully');
    res.render('activity/update', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        client: client,
        target: target,
        referral: referral,
        arr,
        alltarget_client: alldata,
        editdata: editdata[0],
        firm: firm[0].title,
        originAttorney: req.user.first_name + " " + req.user.last_name,
        activity_goal: activity_goal,
        budgetArr,
        practice_area: practice_area,
        level_type,
        section: allSection
    });
});

//update data
router.post('/activity/edit-budget', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    ActivityBudget.destroy({
        where: {
            activity_id: req.body.activity_id
        }
    });
    var budget = JSON.parse(req.body.budget);
    for (var b = 0; b < budget.length; b++) {
        await ActivityBudget.create({
            activity_id: req.body.activity_id,
            activity_goal_id: req.body.activity_goal_id,
            level_type: req.body.activity_level_type,
            budget_id: budget[b].budget_id,
            hour: budget[b].budget_hour,
            amount: budget[b].budget_amount,
            approver_remarks: budget[b].remarks_budgets
        });
    }
    await Activity.update({
        total_budget_amount: req.body.total_amount,
        total_budget_hour: req.body.total_Hour
    }, {
        where: {
            id: req.body.activity_id
        }
    });
    res.json({
        success: true
    });
});

router.post('/activity/update/:id', auth, upload.single('activity_attachment'), firmAttrAuth, csrfProtection, async (req, res) => {
    target_user = [];
    client_user = [];
    referral_user = [];

    target_user = req.body.target_user;
    client_user = req.body.client_user;
    referral_user = req.body.referral_user;

    const CreationDate1 = req.body.activity_creation_date ? req.body.activity_creation_date.split("-") : '';
    const FormDate1 = req.body.activity_from_date ? req.body.activity_from_date.split("-") : '';
    const ToDate1 = req.body.activity_to_date ? req.body.activity_to_date.split("-") : '';

    const activityBudgetData = await ActivityBudget.findAll({
        where: {
            'activity_id': req.body.activity_id
        }
    })

    var targetClientLength;
    if (activityBudgetData[0].level_type === 'Individual') {
        if (target_user !== undefined) {
            targetClientLength = target_user.length;
        }
        if (client_user !== undefined) {
            targetClientLength = client_user.length;
        }
        if (referral_user !== undefined) {
            targetClientLength = referral_user.length;
        }

        for (var b = 0; b < activityBudgetData.length; b++) {
            var totalHour = targetClientLength * activityBudgetData[b].hour;
            var totalAmount = targetClientLength * activityBudgetData[b].amount;
            await ActivityBudget.update({
                hour: totalHour,
                amount: totalAmount
            }, {
                where: {
                    'activity_id': req.body.activity_id,
                    'budget_id': activityBudgetData[b].budget_id
                }
            });
        }
    }

    await Activity.update({
        firm: req.body.firm,
        activity_type: req.body.activity_type,
        activity_goal_id: req.body.activity_goal,
        practice_area: req.body.practice_area,
        potiential_revenue: req.body.potiential_revenue,
        remarks: req.body.remarks,
        activity_creation_date: CreationDate1 ? CreationDate1[2] + "-" + CreationDate1[1] + "-" + CreationDate1[0] : null,
        activity_from_date: FormDate1 ? FormDate1[2] + "-" + FormDate1[1] + "-" + FormDate1[0] : null,
        activity_to_date: FormDate1 ? ToDate1[2] + "-" + ToDate1[1] + "-" + ToDate1[0] : null,
        activity_name: req.body.activity_name,
        activity_reason: req.body.activity_reason,
        budget_status: req.body.budget_status,
        budget_details_status: req.body.budget_details_status,
        target: req.body.ref_type,
        section_id: req.body.section,
        s_group_id: req.body.strategy_group,
        activity_status: req.body.activity_status,
        attachment_field: fileName
    }, {
        where: {
            id: req.params['id']
        }
    });
    await Activity_to_user_type.destroy({
        where: {
            activity_id: req.params['id']
        }
    });
    if (req.body.ref_type == "T") {
        for (var i = 0; i < target_user.length; i++) {
            await Activity_to_user_type.create({
                activity_id: req.params['id'],
                target_client_type: req.body.ref_type,
                type: target_user[i]
            });
        }
    } else if (req.body.ref_type == "C") {
        for (var j = 0; j < client_user.length; j++) {
            await Activity_to_user_type.create({
                activity_id: req.params['id'],
                target_client_type: req.body.ref_type,
                type: client_user[j]
            });
        }
    } else {
        for (var k = 0; k < referral_user.length; k++) {
            await Activity_to_user_type.create({
                activity_id: req.params['id'],
                target_referral_type: req.body.ref_type,
                type: referral_user[k]
            });
        }
    }

    res.redirect('/activitypage');
});

router.get('/activity/update_approval_request/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
    var userInformation_4_l4;
    var userInformation_4_l3;
    var userInformation_4_l2;
    var userInformation_4_l1;
    var userInformation_2_l2;
    var userInformation_2_l1;

    const firmDetails = await Firm.findOne({
        where: {
            'id': req.user.firm_id
        }
    });


    if (firmDetails['approval_level'] === 2) {

        userInformation_2_l2 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_2'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_2_l2 === null) {
            userInformation_2_l2 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_2'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }

        userInformation_2_l1 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_1'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_2_l1 === null) {
            userInformation_2_l1 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_1'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }

    } else if (firmDetails['approval_level'] === 3) {

        var userInformation_3_l3 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_3'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_3_l3 === null) {
            var userInformation_3_l3 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_3'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }


        var userInformation_3_l2 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_2'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_3_l2 === null) {
            var userInformation_3_l2 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_2'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }

        var userInformation_3_l1 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_1'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_3_l1 === null) {
            var userInformation_3_l1 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_1'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }

    } else if (firmDetails['approval_level'] === 4) {

        userInformation_4_l4 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_4'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });
        // if (userInformation_4_l4) {
        //     requestApproval.create({
                
        //     })
        // }

        userInformation_4_l3 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_3'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        userInformation_4_l2 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_2'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        userInformation_4_l1 = await User.findOne({
            where: {
                'designation_id': firmDetails['level_1'],
                'section_id': 0,
                'firm_id': req.user.firm_id
            }
        });

        if (userInformation_4_l4 === null) {
            var userInformation_4_l4 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_4'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });

        }
        if (userInformation_4_l3 === null) {
            var userInformation_4_l3 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_3'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }
        if (userInformation_4_l2 === null) {
            userInformation_4_l2 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_2'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }
        if (userInformation_4_l1 === null) {
            userInformation_4_l1 = await User.findOne({
                where: {
                    'designation_id': firmDetails['level_1'],
                    'section_id': req.user['section_id'],
                    'firm_id': req.user.firm_id
                }
            });
        }



    }

    console.log('------------------------------');
    console.log('------------------------->1', userInformation_4_l4.id);
    console.log('------------------------->2', userInformation_4_l3);
    console.log('------------------------->3', userInformation_4_l2.id);
    console.log('------------------------->4', userInformation_4_l1);
    console.log('------------------------------');



    // console.log(userInformation_4_l4[0]['id'],userInformation_4_l3[0]['id'],userInformation_4_l2[0]['id'],userInformation_4_l1[0]['id']);



    /* await Activity.update({
        activity_status: 1
    }, {
        where: {
            id: req.params['id']
        }
    }); */

    res.json({
        success: true
    });
});

router.get('/activity/deletedata/:id', auth, firmAttrAuth, async (req, res) => {
    await Activity.destroy({
        where: {
            id: req.params['id']
        }
    });
    await Activity_to_user_type.destroy({
        where: {
            activity_id: req.params['id']
        }
    });
    await ActivityBudget.destroy({
        where: {
            activity_id: req.params['id']
        }
    });
    req.flash('success-message', 'Activity deleted Successfully');
    res.redirect('/activitypage');
});

//====================================END ACTIVITY=============================================================================//

module.exports = router;