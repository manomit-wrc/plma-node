const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const ActivityGoal = require('../models').activity_goal;
const StrategicGoal = require('../models').strategic_goal;
const Firm = require('../models').firm;
const Activity = require('../models').activity;
const ActivityBudget = require('../models').activity_budget;
const csrf = require('csurf');
var csrfProtection = csrf({
    cookie: true
});
const router = express.Router();

router.get("/strategic-marketing-goal", auth, firmAttrAuth, async(req, res)=> {
    var success_message = req.flash('success-strategicGoal-message')[0];
    var success_edit_message = req.flash('success-strategicEditGoal-message')[0];
    var success_Del_message = req.flash('success-strategicDelGoal-message')[0];
    StrategicGoal.hasMany(ActivityGoal, {
        foreignKey: 'strategic_goal_id'
    });
    var whereGoals = {};
    if (req.user.role_id == 2) {
        whereGoals.firm_id = req.user.firm_id;
    } else {
        whereGoals.firm_id = req.user.firm_id;
        whereGoals.user_id = req.user.id;
    }
    const strategic_show = await StrategicGoal.findAll({
        where: whereGoals,
        include: [{
            model: ActivityGoal
        }]
    });
    
    res.render("strategic_goals/index", {
        layout: 'dashboard',
        title: 'Strategic Masketing Goals Listing',
        strategic_show,
        success_message,
        success_edit_message,
        success_Del_message
    });
});

router.get("/strategic-marketing-goal/add", auth, firmAttrAuth, csrfProtection, async(req, res)=> {
    res.render("strategic_goals/add", {
        layout: 'dashboard',
        title: 'Add Strategic Matketing Goal',
        csrfToken: req.csrfToken()
    });
});

router.post("/strategic-marketing-goal/add", auth, firmAttrAuth, csrfProtection, async(req, res)=> {
    const stragic_add = await StrategicGoal.create({
        firm_id: req.user.firm_id,
        user_id: req.user.id,
        name: req.body.stragic_goal_name,
        description: req.body.description,
    });
    req.flash('success-strategicGoal-message', 'Strategic Goals Created Successfully');
    res.redirect('/strategic-marketing-goal');
});

router.get("/strategic-marketing-goal/edit/:id", auth, firmAttrAuth, csrfProtection, async(req, res)=>{
    const strategic_edit = await StrategicGoal.findById(req.params['id']);
    res.render("strategic_goals/edit", {
        layout: 'dashboard',
        title: 'Edit Strategic Marketing Goal',
        strategic_edit,
        csrfToken: req.csrfToken()
    });
});

router.get("/strategic-marketing-goal/view/:id", auth, firmAttrAuth, csrfProtection, async (req, res) => {
    const strategic_view = await StrategicGoal.findById(req.params['id']);
    res.render("strategic_goals/view", {
        layout: 'dashboard',
        title: 'View Strategic Marketing Goal',
        strategic_view,
        csrfToken: req.csrfToken()
    });
});

router.post("/strategic-marketing-goal/edit/:id", auth, firmAttrAuth, csrfProtection, async(req, res)=> {
    const strategicEdit = await StrategicGoal.update({
        name: req.body.stragic_goal_name,
        description: req.body.description,
    },{
        where: {
            id: req.params['id']
        }
    });
    req.flash('success-strategicEditGoal-message', 'Strategic Goals Updated Successfully');
    res.redirect('/strategic-marketing-goal');
});

router.get("/strategic-marketing-goal/delete/:id", auth, firmAttrAuth, async(req, res)=>{
    const strategic_del = await StrategicGoal.destroy({
        where: {
            id: req.params['id']
        }
    });
    req.flash('success-strategicDelGoal-message', 'Strategic Goals Deleted Successfully');
    res.redirect('/strategic-marketing-goal');
});

router.get("/strategic-marketing-goal/view-tactical_goals/:id", auth, firmAttrAuth, async(req, res)=> {
    ActivityGoal.belongsTo(Firm, {
        foreignKey: 'firm_id'
    });
    ActivityGoal.hasMany(ActivityBudget, {
        foreignKey: 'activity_goal_id'
    });
    ActivityGoal.hasMany(Activity, {
        foreignKey: 'activity_goal_id'
    });
    const asso_goal = await ActivityGoal.findAll({
        where: {
            strategic_goal_id: req.params['id']
        },
        include: [{
            model: Firm
        }, {
            model: Activity
        }, {
            model: ActivityBudget
        }]
    });
    res.render("strategic_goals/view_tactical_goal", {
        layout: 'dashboard',
        title: 'View Tactical Marketing Goal',
        asso_goal,
    });
});

module.exports = router;