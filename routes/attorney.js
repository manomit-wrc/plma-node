const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Designation = require('../models').designation;
const Section = require('../models').section;
const PracticeArea = require('../models').practicearea;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const Attorney_Details = require('../models').attorney_details;
const Industry_type = require('../models').industry_type;
const Jurisdiction = require('../models').jurisdiction;
const sectionToFirm = require('../models').section_to_firms;
const PracticeAreaToFirm = require('../models').practice_area_to_firms;
const PracticeAreaToAttr = require('../models').practice_area_to_attorney;
const Education = require('../models').education;
var csrfProtection = csrf({
	cookie: true
});

const Firm = require('../models').firm;
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
	var success_message = req.flash('success-attorney-message')[0];
	var success_edit_message = req.flash('success-edit-attorney-message')[0];
	var attar_information = [];
	
	User.hasMany(Attorney_Details, {
		foreignKey: 'user_id'
	});

	const attr = await User.findAll({
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		},
		include: [{
			model: Attorney_Details
		}]
	});



	for (var i = 0; i < attr.length; i++) {
		var name = attr[i].first_name + " " + attr[i].last_name;
		var email = attr[i].email;
		var mobile_no = attr[i].mobile_no;
		var id = attr[i].id;
		var attr_type = attr[i].attorney_details.length > 0 ? (attr[i].attorney_details[0].attorney_type !== '' ? attr[i].attorney_details[0].attorney_type : 'N/A') : 'N/A';

		attar_information.push({
			name: name,
			email: email,
			mobile_no: mobile_no,
			id: id,
			attr_type: attr_type,
		})
	}

	res.render('attorney/index', {
		layout: 'dashboard',
		success_message,
		success_edit_message,
		csrfToken: req.csrfToken(),
		row: attar_information
	});
});


router.post("/get-firm-user-designation", auth, async (req, res) => {
	const get_desig = await User.findAll({
		where: {
			firm_id: req.user.firm_id,
			designation_id: req.body.designation_id
		}
	});
	if (get_desig.length == 0) {
		res.json({
			"success": true
		});
	} else {
		res.json({
			"success": false
		});
	}
});

router.post("/get-section-user-designation", auth, async (req, res) => {
	const sectionDesig = await User.findAll({
		where: {
			firm_id: req.user.firm_id,
			section_id: req.body.section_id,
			designation_id: req.body.designation_id,
		}
	});
	if (sectionDesig.length == 0) {
		res.json({
			"success": true
		});
	} else {
		res.json({
			"success": false
		});
	}
});

router.get("/get-approval-designation", auth, async (req, res) => {
	const getLevel = await Firm.findAll({
		where: {
			id: req.user.firm_id
		}
	});
	var designationLevel = [];
	designationLevel.push(getLevel[0].level_1);
	if (getLevel[0].level_2 !== 0) {
		designationLevel.push(getLevel[0].level_2);
	}
	if (getLevel[0].level_3 !== 0) {
		designationLevel.push(getLevel[0].level_3);
	}
	if (getLevel[0].level_4 !== 0) {
		designationLevel.push(getLevel[0].level_4);
	}
	const designation = await Designation.findAll({
		where: {
			id: designationLevel
		}
	})
	res.send({
		designations: designation
	});
});

router.get("/get-all-designation", auth, async (req, res) => {
	const designation = await Designation.findAll();
	res.send({
		designations: designation
	});
});

router.get('/attorneys/addAttorney', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var err_message = req.flash('success-err-message')[0];
	const designation = await Designation.findAll();
	const group = await Group.findAll({
		order: [
			['name', 'ASC'],
		]
	});
	sectionToFirm.belongsTo(Section, {
		foreignKey: 'section_id'
	});
	PracticeAreaToFirm.belongsTo(PracticeArea, {
		foreignKey: 'practice_area_id'
	});

	const allSection = await sectionToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},

		include: [{
			model: Section
		}]
	});
	const allPracticeArea = await PracticeAreaToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},

		include: [{
			model: PracticeArea
		}]
	});
	const jurisdiction = await Jurisdiction.findAll({
		order: [
			['name', 'ASC'],
		]
	});
	const industry_type = await Industry_type.findAll({
		order: [
			['industry_name', 'ASC'],
		]
	});
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
		section: allSection,
		jurisdiction: jurisdiction,
		industry_type: industry_type,
		err_message,
		allPracticeArea
	});
});


router.post('/attorneys/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var practice_area = req.body.practice_area;
	var education = [];
	var degree = req.body.degree;
	var university = req.body.university;
	var year = req.body.year;
	for (var d = 0; d < degree.length; d++) {
		if (degree[d] !== "") {
			var ddd = degree[d];
			var uuu = university[d];
			var yyy = year[d];
			education.push({
				"degree": ddd,
				"university": uuu,
				"year": yyy
			});
		}
	}

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
			email: req.body.mail
		}
	});
	if (attorney_data != null) {
		req.flash('success-err-message', 'Email ID already exists');
		res.redirect('/attorneys/addAttorney');
	} else {
		await User.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.mail,
			password: bCrypt.hashSync(req.body.pass),
			dob: req.body.dob,
			gender: req.body.gender,
			address: req.body.address,
			avatar,
			status: 1,
			role_id: 3,
			firm_id: req.user.firm_id,
			group_id: parseInt(req.body.group),
			section_id: parseInt(req.body.section),
			designation_id: parseInt(req.body.designation),
			approver: req.body.approver ? parseInt(req.body.approver) : 0,
			city: req.body.city,
			state: req.body.state,
			country: req.body.country,
			zipcode: req.body.zipcode,
			mobile_no: removeMobileMask(req.body.mobile_no),
			dob: Dob ? Dob[2] + "-" + Dob[1] + "-" + Dob[0] : null,

		}).then( async function (resp)  {
			attrorney_details_id = resp.id;

			await Attorney_Details.create({
				group: parseInt(req.body.group),
				section: parseInt(req.body.section),
				designation: parseInt(req.body.designation),
				attorney_id: req.body.attorney_id,
				attorney_code: req.body.attorney_code,
				attorney_type: req.body.attorney_type,
				bar_registration: req.body.bar_registration,
				job_type: req.body.job_type,
				jurisdiction: parseInt(req.body.jurisdiction),
				industry_type: '0',
				hourly_cost: req.body.hourly_cost,
				benefit_factor: req.body.benefit_factor,
				overhead_amount: req.body.overhead_amount,
				billing_opp_cost: req.body.billing_opp_cost,
				address2: req.body.address2,
				address3: req.body.address3,
				phone_no: removePhoneMask(req.body.phone_no),
				fax: removePhoneMask(req.body.fax),
				website_url: req.body.website_url,
				social_url: req.body.social_url,
				remarks: req.body.remarks,
				user_id: attrorney_details_id,
				firm_join_date: Firm_Join_Date ? Firm_Join_Date[2] + "-" + Firm_Join_Date[1] + "-" + Firm_Join_Date[0] : null,
				bar_practice_date: Bar_Practice_date ? Bar_Practice_date[2] + "-" + Bar_Practice_date[1] + "-" + Bar_Practice_date[0] : null,

			});
			for (var e = 0; e < education.length; e++) {
				const edu = await Education.create({
					user_id: attrorney_details_id,
					degree: education[e].degree,
					university: education[e].university,
					year: education[e].year
				});
			}
			for (var p = 0; p < practice_area.length; p++) {
				const practicearea = await PracticeAreaToAttr.create({
					attorney_id: attrorney_details_id,
					firm_id: req.user.firm_id,
					practice_area_id: practice_area[p],
				});
			}
		});

		req.flash('success-attorney-message', 'Attorney Created Successfully');
		res.redirect('/attorneys');
	}
});

router.get('/attorneys/edit/:id', auth, csrfProtection, async (req, res) => {
	User.hasMany(Attorney_Details, {
		foreignKey: 'user_id'
	});
	User.hasMany(Education, {
		foreignKey: 'user_id'
	});
	User.hasMany(PracticeAreaToAttr, {
		foreignKey: 'attorney_id'
	});

	const designation = await Designation.findAll();
	const group = await Group.findAll({
		order: [
			['name', 'ASC'],
		]
	});
	sectionToFirm.belongsTo(Section, {
		foreignKey: 'section_id'
	});

	PracticeAreaToFirm.belongsTo(PracticeArea, {
		foreignKey: 'practice_area_id'
	});

	const allSection = await sectionToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},
		include: [{
			model: Section
		}]
	});

	const allPracticeArea = await PracticeAreaToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},

		include: [{
			model: PracticeArea
		}]
	});
	const jurisdiction = await Jurisdiction.findAll({
			order: [
				['name', 'ASC'],
			]
		}

	);
	const industry_type = await Industry_type.findAll({
		order: [
			['industry_name', 'ASC'],
		]
	});

	const country = await Country.findAll({});
	const state = await State.findAll({});
	const edata = await User.findAll({
		where: {
			id: req.params['id']
		},
		include: [{
			model: Attorney_Details
		}, {
			model: Education
		}, {
			model: PracticeAreaToAttr
		}]
	});
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
	 var result = JSON.parse(JSON.stringify(edata[0].practice_area_to_attorneys));
	 var arr = [];
	 for (var i = 0; i < result.length; i++) {
	 	arr.push(result[i].practice_area_id);
	 }

	res.render('attorney/updateattorney', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		country: country,
		state: state,
		designation: designation,
		group: group,
		section: allSection,
		jurisdiction: jurisdiction,
		industry_type: industry_type,
		edata: edata,
		zipcode,
		city,
		allPracticeArea,
		arr
	});
});


router.get('/attorneys/viewdata/:id', auth, csrfProtection, async (req, res) => {

	User.hasMany(Attorney_Details, {
		foreignKey: 'user_id'
	});
	User.hasMany(Education, {
		foreignKey: 'user_id'
	});
	PracticeAreaToFirm.belongsTo(PracticeArea, {
		foreignKey: 'practice_area_id'
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
		}, {
			model: Education
		}, {
			model: PracticeAreaToAttr
		}]
	});
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
	const allPracticeArea = await PracticeAreaToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},

		include: [{
			model: PracticeArea
		}]
	});

	var result = JSON.parse(JSON.stringify(edata[0].practice_area_to_attorneys));
	 var arr = [];
	 for (var i = 0; i < result.length; i++) {
	 	arr.push(result[i].practice_area_id);
	 }
	res.render('attorney/viewattorney', {
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
		city,
		allPracticeArea,
		arr
	});
});


router.post('/attorneys/update/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var practice_area = req.body.practice_area;
	var education = [];
	var degree = req.body.degree;
	var university = req.body.university;
	var year = req.body.year;
	for (var d = 0; d < degree.length; d++) {
		if (degree[d] !== "") {
			var ddd = degree[d];
			var uuu = university[d];
			var yyy = year[d];
			education.push({
				"degree": ddd,
				"university": uuu,
				"year": yyy
			});
		}
	}
	const Dob1 = req.body.dob ? req.body.dob.split("-") : '';
	const Firm_Join_Date1 = req.body.firm_join_date ? req.body.firm_join_date.split("-") : '';
	const Bar_Practice_date1 = req.body.bar_practice_date ? req.body.bar_practice_date.split("-") : '';

	await User.update({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		gender: req.body.gender,
		address: req.body.address,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
		group_id: parseInt(req.body.group),
		section_id: parseInt(req.body.section),
		designation_id: parseInt(req.body.designation),
		zipcode: req.body.zipcode,
		mobile_no: removeMobileMask(req.body.mobile_no),
		avatar: req.body.fileName,
		dob: Dob1 ? Dob1[2] + "-" + Dob1[1] + "-" + Dob1[0] : null,
	}, {
		where: {
			id: req.params['id']
		}
	});

	await Attorney_Details.update({
		group: parseInt(req.body.group),
		section: parseInt(req.body.section),
		designation: parseInt(req.body.designation),
		attorney_id: req.body.attorney_id,
		attorney_code: req.body.attorney_code,
		attorney_type: req.body.attorney_type,
		education: req.body.education,
		bar_registration: req.body.bar_registration,
		job_type: req.body.job_type,
		jurisdiction: parseInt(req.body.jurisdiction),
		industry_type: '0',
		hourly_cost: req.body.hourly_cost,
		benefit_factor: req.body.benefit_factor,
		overhead_amount: req.body.overhead_amount,
		billing_opp_cost: req.body.billing_opp_cost,
		address2: req.body.address2,
		address3: req.body.address3,
		e_mail: req.body.e_mail,
		phone_no: removePhoneMask(req.body.phone_no),
		fax: removePhoneMask(req.body.fax),
		website_url: req.body.website_url,
		social_url: req.body.social_url,
		remarks: req.body.remarks,
		firm_join_date: Firm_Join_Date1 ? Firm_Join_Date1[2] + "-" + Firm_Join_Date1[1] + "-" + Firm_Join_Date1[0] : null,
		bar_practice_date: Bar_Practice_date1 ? Bar_Practice_date1[2] + "-" + Bar_Practice_date1[1] + "-" + Bar_Practice_date1[0] : null,

	}, {
		where: {
			user_id: req.params['id']
		}
	});

	const del_edu = await Education.destroy({
		where: {
			user_id: req.params['id']
		}
	});
	for (var e = 0; e < education.length; e++) {
		const edu = await Education.create({
			user_id: req.params['id'],
			degree: education[e].degree,
			university: education[e].university,
			year: education[e].year
		});
	}
	const del_practice = await PracticeAreaToAttr.destroy({
		where: {
			attorney_id: req.params['id']
		}
	});
	for (var p = 0; p < practice_area.length; p++) {
		const practicearea = await PracticeAreaToAttr.create({
			attorney_id: req.params['id'],
			firm_id: req.user.firm_id,
			practice_area_id: practice_area[p],
		});
	}

	req.flash('success-edit-attorney-message', 'Attorney Updated Successfully');
	res.redirect('/attorneys');
});

module.exports = router;
