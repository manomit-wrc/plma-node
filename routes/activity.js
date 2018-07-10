const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const designation = require('../models').designation;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Section = require('../models').section;
const Group = require('../models').group;
const budget = require('../models').budget;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const industry_type = require('../models').industry_type;
const setting = require('../models').setting;
const Jurisdiction = require('../models').jurisdiction;
const user = require('../models').user;
const Activity = require('../models').activity;
const Activity_to_user_type = require('../models').jointactivity;

var csrfProtection = csrf({ cookie: true });
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
const router = express.Router();



const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;
const PracticeArea = require('../models').practicearea;
const Target = require('../models').target;
const Client = require('../models').client;


//===================================================START ACTIVITY===============================================================================//
router.get('/activityseen',auth, firmAttrAuth, csrfProtection, async (req,res) => {
//	var error_message = req.flash('success-activity-message')[0];
var success_message = req.flash('success-activity-message')[0];
const firm = await Firm.findAll();
const activity_goal = await ActivityGoal.findAll();
const practice_area = await PracticeArea.findAll();
const target = await Target.findAll({
	where: {target_type: "I"}
});
const client = await Client.findAll({
	where: {
		client_type : "I"
	}
});


res.render('activity/addactivity',{ layout: 'dashboard', csrfToken: req.csrfToken(),firm: firm, success_message,activity_goal: activity_goal,practice_area: practice_area,client: client,target: target});
});



router.get('/activitypage',auth, firmAttrAuth, csrfProtection, (req,res) => {
	Activity.findAll({

	}).then(row => {
		res.render('activity/activity',{ layout: 'dashboard', csrfToken: req.csrfToken(),row: row });
	});
});


// ========{{    insert data to the database  }}=====================//

router.post('/activity/add',auth, firmAttrAuth,csrfProtection, async (req,res) => {
	var target_user = req.body.target_user;
	var client_user = req.body.client_user;
		//console.log(client_user);
		const activity_store = await	Activity.create({
			firm : req.body.firm,
			activity_type : req.body.activity_type,
			activity_goal : req.body.activity_goal,
			practice_area : req.body.practice_area,
			potiential_revenue : req.body.potiential_revenue,
			remarks : req.body.remarks,
			creation_date : req.body.creation_date,
			from_date : req.body.from_date,
			to_date : req.body.to_date,
			activity_name : req.body.activity_name,
			activity_reason : req.body.activity_reason,
			budget_status : req.body.budget_status,
			budget_details_status : req.body.budget_details_status,
			target : req.body.target,
		});
		if(activity_store)
		{
			if(req.body.target == "T"){
				for(var i=0; i<target_user.length; i++){
					const store_activity_user = await Activity_to_user_type.create({
						activity_id: activity_store.id,
						target_client_type: req.body.target,
						type: target_user[i]
					});
				}
			}
			else {
				{
					for(var j=0; j<client_user.length; j++){
						const store_activity_user = await Activity_to_user_type.create({
							activity_id: activity_store.id,
							target_client_type: req.body.target,
							type: client_user[j]
						});
					}
				}
			}
		}
		req.flash('success-activity-message', 'Activity  Created Successfully');
		res.redirect('/activitypage');
	});

//.....................{{   edit data  }}.......................................//

router.get('/activity/edit/:id',auth,csrfProtection, async (req,res) => {
	const firm = await Firm.findAll();
	const activity_goal = await ActivityGoal.findAll();
	const practice_area = await PracticeArea.findAll();


	const target = await Target.findAll({
		where: {target_type: "I"}
	});
	const client = await Client.findAll({
		where: {
			client_type : "I"
		}
	});


	Activity.findById(req.params.id).then(editdata => {

		res.render('activity/update', { layout: 'dashboard', csrfToken: req.csrfToken(),client: client,target: target, editdata :editdata,firm: firm,activity_goal: activity_goal,practice_area: practice_area });
	});
});


//update data
router.post('/activity/update/:id',auth, firmAttrAuth, csrfProtection, async (req,res) => {
	var target_user = req.body.target_user;
	var client_user = req.body.client_user;
		//console.log(client_user);
		const activity_store1 = await	Activity.update({
			firm : req.body.firm,
			activity_type : req.body.activity_type,
			activity_goal : req.body.activity_goal,
			practice_area : req.body.practice_area,
			potiential_revenue : req.body.potiential_revenue,
			remarks : req.body.remarks,
			creation_date : req.body.creation_date,
			from_date : req.body.from_date,
			to_date : req.body.to_date,
			activity_name : req.body.activity_name,
			activity_reason : req.body.activity_reason,
			budget_status : req.body.budget_status,
			budget_details_status : req.body.budget_details_status,
			target : req.body.target,
		},{where: {id : req.params['id']}
	});
	 // if(activity_store1)
	 // {
		//  if(req.body.target == "T"){
		// 	 for(var i=0; i<target_user.length; i++){
		// 		 const store_activity_user = await Activity_to_user_type.update({
		// 			 activity_id: activity_store1.id,
		// 			 target_client_type: req.body.target,
		// 			 type: target_user[i]
		// 		 });
		// 	 }
		//  }
		//  else {
		//  	{
		// 		for(var j=0; j<client_user.length; j++){
		// 			const store_activity_user = await Activity_to_user_type.update({
		// 				activity_id: activity_store1.id,
		// 				target_client_type: req.body.target,
		// 				type: client_user[j]
 		// 		 });
 		// 	 }
		// 	}
		//  }
	 // }
	 // req.flash('success-activity-message', 'Activity  Created Successfully');
	 res.redirect('/activitypage');
	});


  //        {{   delete data  }}


  router.get('/activity/deletedata/:id',auth, async(req,res) => {

		// outer.post('/firm/delete', auth, siteAuth, csrfProtection, async (req, res) => {
			const activity_delete = await Activity.destroy({
				where: {
					id: req.params['id']
				}
			});

			const jointactivity_delete = await Activity_to_user_type.destroy({
				where: {
					activity_id: req.params['id']
				}
			});
			res.redirect('/activitypage');


		});
//====================================END ACTIVITY=============================================================================//
module.exports = router;
