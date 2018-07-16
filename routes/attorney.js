const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');

const Designation = require('../models').designation;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Section = require('../models').section;
const budget = require('../models').budget;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const Attorney_Details = require('../models').attorney_details;
const Industry_type = require('../models').industry_type;
const setting = require('../models').setting;
const Jurisdiction = require('../models').jurisdiction;
const multer = require('multer');
const Activity = require('../models').activity;
const Activity_to_user_type = require('../models').jointactivity;
var csrfProtection = csrf({
	cookie: true
});
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
const Firm = require('../models').firm;
const ActivityGoal = require('../models').activity_goal;
const PracticeArea = require('../models').practicearea;
const Target = require('../models').target;
const Client = require('../models').client;
const User = require('../models').user;
const Group = require('../models').group;


const router = express.Router();

function removePhoneMask(phone_no) {
	var phone_no = phone_no.replace("-", "");
	phone_no = phone_no.replace(")", "");
	phone_no = phone_no.replace("(", "");
	phone_no = phone_no.replace(" ", "");
	return phone_no;
}

function removeMobileMask(mobile_no) {
	var mobile_no = mobile_no.replace("-", "");
	mobile_no = mobile_no.replace(")", "");
	mobile_no = mobile_no.replace("(", "");
	mobile_no = mobile_no.replace(" ", "");
	return mobile_no;
}



router.get('/attorneys', auth, csrfProtection, async (req, res) => {
	var success_message = req.flash('success-message')[0];
	const attr = await User.findAll({
		where: {
			role_id: 3
		}
	});
	res.render('attorney/index', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		row: attr
	});
});

router.get('/attorney/addAttorney', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var err_message = req.flash('success-err-message')[0];
	const designation = await Designation.findAll();
	const group = await Group.findAll();
	const section = await Section.findAll();
	const jurisdiction = await Jurisdiction.findAll();
	const industry_type = await Industry_type.findAll();
	var country = await Country.findAll();
	const state = await State.findAll({
		where: {
			country_id: "233"
		}
	});
	res.render('attorney/addattorney', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		country: country,
		state: state,
		designation: designation,
		group: group,
		section: section,
		jurisdiction: jurisdiction,
		industry_type: industry_type,
		err_message
	});
});

// insert data to the database




router.post('/attorney/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {

	var attrorney_details_id = '';
	const Dob = req.body.dob ? req.body.dob.split("-") : '';
	const Firm_Join_Date = req.body.firm_join_date ? req.body.firm_join_date.split("-") : '';
	const Bar_Practice_date = req.body.bar_practice_date ? req.body.bar_practice_date.split("-") : '';
	const avatar = gravatar.url(req.body.email, {
		s: '150',
		r: 'pg',
		d: 'mm'
	});
	const attorney_data = await User.findOne({
		where: {
			email: req.body.email
		}
	});
	if (attorney_data != null) {
		req.flash('success-err-message', 'Email ID already exists');
		res.redirect('/attorney/addAttorney');
	} else {
		const user_details = await User.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password: bCrypt.hashSync(req.body.password),
			dob: req.body.dob,
			gender: req.body.gender,
			address: req.body.address,
			avatar,
			status: 1,
			role_id: 3,
			firm_id: req.user.firm_id,
			city: req.body.city,
			state: req.body.state,
			country: req.body.country,
			zipcode: req.body.zipcode,
			mobile_no: removeMobileMask(req.body.mobile_no),


			dob: Dob ? Dob[2] + "-" + Dob[1] + "-" + Dob[0] : null,

		}).then(function (resp) {
			attrorney_details_id = resp.id;

			const user_details = Attorney_Details.create({

				group: req.body.group,
				section: req.body.section,
				designation: req.body.designation,
				attorney_id: req.body.attorney_id,
				attorney_code: req.body.attorney_code,
				attorney_type: req.body.attorney_type,
				education: req.body.education,
				bar_registration: req.body.bar_registration,
				job_type: req.body.job_type,
				bar_practice_date: req.body.bar_practice_date,
				firm_join_date: req.body.firm_join_date,
				jurisdiction: req.body.jurisdiction,
				industry_type: req.body.industry_type,
				hourly_cost: req.body.hourly_cost,
				benefit_factor: req.body.benefit_factor,
				overhead_amount: req.body.overhead_amount,
				billing_opp_cost: req.body.billing_opp_cost,
				address2: req.body.address2,
				address3: req.body.address3,
				phone_no:  removePhoneMask(req.body.phone_no),


				fax: req.body.fax,
				website_url: req.body.website_url,
				social_url: req.body.social_url,
				remarks: req.body.remarks,
				user_id: attrorney_details_id,


				firm_join_date: Firm_Join_Date ? Firm_Join_Date[2] + "-" + Firm_Join_Date[1] + "-" + Firm_Join_Date[0] : null,
				bar_practice_date: Bar_Practice_date ? Bar_Practice_date[2] + "-" + Bar_Practice_date[1] + "-" + Bar_Practice_date[0] : null,

			});
		});
		res.redirect('/attorneys');
	}


});

//
//
//         END INSERT
//
//
//

router.get('/attorney/edit/:id', auth, csrfProtection, async (req, res) => {
	User.hasMany(Attorney_Details, {
		foreignKey: 'user_id'
	});

	const designation = await Designation.findAll();
	const group = await Group.findAll();
	const section = await Section.findAll();
	const jurisdiction = await Jurisdiction.findAll();
	const industry_type = await Industry_type.findAll();

	const country = await Country.findAll({});
	const state = await State.findAll({});
	const edata = await User.findAll({
		where: {
			id: req.params['id']
		},
		include: [{
			model: Attorney_Details
		}]
	});
	// console.log(edata);
	var state_id = edata[0].state;
	var city_id = edata[0].city;
	var city = [];
	var zipcode = [];
	if (state_id != null) {
		city = await City.findAll({
			where: {
				state_id: state_id.toString()
			}
		});
	}
	if (city_id != null) {
		const cities = await City.findById(city_id.toString());
		zipcode = await Zipcode.findAll({
			where: {
				city_name: cities.name
			}
		});
	}
	// console.log(edata[0].state);
	res.render('attorney/updateattorney', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		country: country,
		state: state,
		designation: designation,
		group: group,
		section: section,
		jurisdiction: jurisdiction,
		industry_type: industry_type,
		edata: edata,
		zipcode,
		city
	});
});





//
//
//         END EDIT
//
//
//

//  {{{    delete data}}}
router.get('/attorney/deletedata/:id', auth, async (req, res) => {

	// outer.post('/firm/delete', auth, siteAuth, csrfProtection, async (req, res) => {
	const user_delete = await User.destroy({
		where: {
			id: req.params['id']
		}
	});

	const attorney_delete = await Attorney_Details.destroy({
		where: {
			user_id: req.params['id']
		}
	});
	res.redirect('/attorneys');


});
//
//
//
//  {{{    delete data}}}
//
//
//


router.post('/attorney/update/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {

	const Dob1 = req.body.dob ? req.body.dob.split("-") : '';
	const Firm_Join_Date1 = req.body.firm_join_date ? req.body.firm_join_date.split("-") : '';
	const Bar_Practice_date1 = req.body.bar_practice_date ? req.body.bar_practice_date.split("-") : '';

	const user_update = await User.update({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		gender: req.body.gender,
		address: req.body.address,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
		zipcode: req.body.zipcode,
		mobile_no: removeMobileMask(req.body.mobile_no),

		avatar: req.body.fileName,
		dob: Dob1 ? Dob1[2] + "-" + Dob1[1] + "-" + Dob1[0] : null,
	}, {
		where: {
			id: req.params['id']
		}
	});

		const attr_update = await Attorney_Details.update({
			group: req.body.group,
			section: req.body.section,
			designation: req.body.designation,
			attorney_id: parseInt(req.body.attorney_id),
			attorney_code: req.body.attorney_code,
			attorney_type: req.body.attorney_type,
			education: req.body.education,
			bar_registration: req.body.bar_registration,
			job_type: req.body.job_type,
			bar_practice_date: req.body.bar_practice_date,
			firm_join_date: req.body.firm_join_date,
			jurisdiction: req.body.jurisdiction,
			industry_type: req.body.industry_type,
			hourly_cost: req.body.hourly_cost,
			benefit_factor: req.body.benefit_factor,
			overhead_amount: req.body.overhead_amount,
			billing_opp_cost: req.body.billing_opp_cost,
			address2: req.body.address2,
			address3: req.body.address3,
			e_mail: req.body.e_mail,
			phone_no: removePhoneMask(req.body.phone_no),
			fax: req.body.fax,
			website_url: req.body.website_url,
			social_url: req.body.social_url,
			remarks: req.body.remarks,
			avatar: req.body.fileName,
			firm_join_date: Firm_Join_Date1 ? Firm_Join_Date1[2] + "-" + Firm_Join_Date1[1] + "-" + Firm_Join_Date1[0] : null,
			bar_practice_date: Bar_Practice_date1 ? Bar_Practice_date1[2] + "-" + Bar_Practice_date1[1] + "-" + Bar_Practice_date1[0] : null,

		}, {
			where: {
				user_id: req.params['id']
			}
		});


	res.redirect('/attorneys');
});

//==========================================================end===================================================//
module.exports = router;
