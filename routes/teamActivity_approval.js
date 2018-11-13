const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const activityAttorney = require('../models').activity_attorney;
const User = require('../models').user;
const notificationTable = require('../models').notificationTable;
const router = express.Router();

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


router.get('/team-activity-approvals', auth, async (req, res) => {

    activityAttorney.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });
    
    const teamActivityAttorney = await activityAttorney.findAll({
        where: {
            'attorney_id': req.user.id,
            'status': '0',
        },
        include: [{
            model: Activity
        }],
    }); 
    
    res.render('team_activity_approvals/index', {
        layout: 'dashboard',
        title: 'Team Activity Listing',
        teamActivityAttorney
    });
});


router.get('/tempActivity/approvalRequest/', auth, async (req, res) => {

    const activityId = req.query['activity_id'];
    const requestApproval = req.query['approvalStatus'];

    if (requestApproval==='approva') {
        await activityAttorney.update({
            'status': 1
        },{
            where: {
                'activity_id': activityId,
                'attorney_id' : req.user.id
            }
        });
        const tot_attr = await activityAttorney.findAll({
            where: {
                activity_id: activityId
            }
        });
        const tot_accpt_attr = await activityAttorney.findAll({
            where: {
                activity_id: activityId,
                status: "1"
            }
        });
        var pending_accpt = parseInt(tot_attr.length) - parseInt(tot_accpt_attr.length);
        if (pending_accpt == "0") {
            const activity = await Activity.findById(activityId);
            await notificationTable.create({
                notification_details: "All team members have accepted the invitation for " + activity.activity_name,
                activity_type_id: parseInt(activity.user_id),
                sender_id: parseInt(req.user.id),
                status: 0,
                link: "/activity/view/" + activityId
            });
        }
    } else {
        await activityAttorney.update({
            'status': 2
        },{
            where: {
                'activity_id': activityId,
                'attorney_id' : req.user.id
            }
        });
    }

    res.json({
        success: true,
        code: 100
    });

    
});



module.exports = router;