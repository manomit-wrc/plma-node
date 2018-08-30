const express = require('express');
const auth = require('../middlewares/auth');
const Activity = require('../models').activity;
const activityAttorney = require('../models').activity_attorney;
const User = require('../models').user;
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

    // console.log('activityAttorney',_activityAttorney[0].activity);
    
    
    res.render('team_activity_approvals/index', {
        layout: 'dashboard',
        teamActivityAttorney
    });
});



module.exports = router;