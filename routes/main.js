const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const Designation = require('../models').designation;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const PracticeArea = require('../models').practicearea;
const Section = require('../models').section;
const Group = require('../models').group;
const budget = require('../models').budget;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const Industry = require('../models').industry_type;
const Tag = require('../models').tag;
const setting = require('../models').setting;
const target = require('../models').target;
const Jurisdiction = require('../models').jurisdiction;
const client = require('../models').client;
const user = require('../models').user;
var csrfProtection = csrf({
	cookie: true
});
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
const multer = require('multer');
var xlsx = require('node-xlsx');
const router = express.Router();
var fileExt = '';
var fileName = '';

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/import-client-excel');
	},
	filename: function (req, file, cb) {
		fileExt = 'xlsx';
		fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
		cb(null, fileName);
	}
})
var upload_client_excel = multer({
	storage: storage
});

function removePhoneMask(phone_no) {
	var phone_no = phone_no.replace("-", "");
	phone_no = phone_no.replace(")", "");
	phone_no = phone_no.replace("(", "");
	phone_no = phone_no.replace(" ", "");
	phone_no = phone_no.replace("$", "");
	phone_no = phone_no.replace(",", "");
	return phone_no;

}

/*==========================Start Budget//Bratin Meheta 06-07-2018=============================*/

router.get('/budget', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-budget-message')[0];
	var whereCondition = {};
	if (req.query.budget_name) {
		whereCondition.name = req.query.budget_name;
	}
	budget.findAll({
		order: [
			['name', 'ASC']
		],

		where: whereCondition
	}).then(show => {
		res.render('budget/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			budget: show,
			budget_code: req.query.budget_code ? req.query.budget_code : '',
			budget_name: req.query.budget_name ? req.query.budget_name : ''
		});
	});
});

router.post('/budget/add', auth, siteAuth, csrfProtection, (req, res) => {
	budget.findAndCountAll({
		
		where: {
			name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			budget.create({
				name: req.body.name,
				parent_id: req.body.parent_id,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"add_budget": 1
				});
			});
		} else {
			res.json({
				"add_budget": 2
			});
		}
	});
});

router.post('/admin/edit-budget/:id', auth, siteAuth, csrfProtection, (req, res) => {
	budget.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(budgets => {
		if (budgets.length === 0) {
			budget.update({
				name: req.body.edit_name,
				parent_id: req.body.edit_parent_id,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_budget": 1
				});
			});
		} else {

			res.json({
				"edit_budget": 2
			});
		}
	});
});

router.post('/admin/delete-budget/:id', auth, siteAuth, csrfProtection, (req, res) => {
	budget.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-budget-message', 'Budget delete Successfully');
		res.json({
			"del_budget": 1
		});
	});
});



/*========================================End budget========================================*/

/*==========================Start designation//Bratin Meheta 06-07-2018=============================*/

router.get('/designation', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-designation-message')[0];
	var whereCondition = {};
	if (req.query.designation_name) {
		whereCondition.title = req.query.designation_name;
	}
	Designation.findAll({
		where: whereCondition
	}).then(show => {
		res.render('designation/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			designation: show,
			designation_code: req.query.designation_code ? req.query.designation_code : '',
			designation_name: req.query.designation_name ? req.query.designation_name : ''
		});
	});
});

router.post('/designation/add', auth, siteAuth, csrfProtection, (req, res) => {
	Designation.findAndCountAll({
		where: {
			title: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			Designation.create({
				title: req.body.name,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"add_designation": 1
				});
			});
		} else {
			res.json({
				"add_designation": 2
			});
		}
	});
});

router.post('/admin/edit-designation/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Designation.findAll({
		where: {
			title: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(designations => {
		if (designations.length === 0) {
			Designation.update({
				title: req.body.edit_name,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_designation": 1
				});
			});
		} else {

			res.json({
				"edit_designation": 2
			});
		}
	});
});

router.post('/admin/delete-designation/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Designation.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-designation-message', 'Designation delete Successfully');
		res.json({
			"del_designation": 1
		});
	});
});

/*========================================End designation========================================*/

/*==========================Start industry_type//Bratin Meheta 06-07-2018=============================*/

router.get('/industry', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-industry-message')[0];
	var whereCondition = {};
	if (req.query.industry_name) {
		whereCondition.industry_name = req.query.industry_name;
	}
	Industry.findAll({
		where: whereCondition
	}).then(show => {
		res.render('industry/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			industry: show,
			industry_code: req.query.industry_code ? req.query.industry_code : '',
			industry_name: req.query.industry_name ? req.query.industry_name : ''
		});
	});
});

router.post('/industry/add', auth, siteAuth, csrfProtection, (req, res) => {
	Industry.findAndCountAll({
		where: {
			industry_name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			Industry.create({
				industry_name: req.body.name,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"add_industry": 1
				});
			});
		} else {
			res.json({
				"add_industry": 2
			});
		}
	});
});

router.post('/admin/edit-industry/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Industry.findAll({
		where: {
			industry_name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(industrys => {
		if (industrys.length === 0) {
			Industry.update({
				industry_name: req.body.edit_name,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_industry": 1
				});
			});
		} else {

			res.json({
				"edit_industry": 2
			});
		}
	});
});

router.post('/admin/delete-industry/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Industry.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-industry-message', 'Industry delete Successfully');
		res.json({
			"del_industry": 1
		});
	});
});

/*========================================End industry========================================*/

//============================================={{{{{{settings}}}}}}==========================================


router.get('/settings', auth, csrfProtection, async (req, res) => {

	var sucess_setting_message1 = req.flash('setting-message1')[0];

	let zipcodes;
	const country = await Country.findAll({});
	const state = await State.findAll({});
	const settings = await setting.findById(1);
	const cities = await City.findAll({
		where: {
			state_id: settings.state
		}
	});
	if (settings.city) {
		const current_city = await City.findById(parseInt(settings.city));

		zipcodes = await Zipcode.findAll({
			where: {
				city_name: current_city.name
			}
		});
	}

	res.render('superadminsetting/settings', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		sucess_setting_message1,
		data: settings,
		country: country,
		state: state,
		cities,
		zipcodes
	});
});

//insert
router.post('/settings/insert', auth, csrfProtection, (req, res) => {
	var companyname = req.body.companyname;
	var contactperson = req.body.contactperson;
	var address = req.body.address;
	var country = req.body.country;
	var city = req.body.city;
	var state = req.body.state;
	var postalcode = req.body.postalcode;
	var email = req.body.email;
	var phnumber = req.body.phnumber;
	var mbnumber = req.body.mbnumber;
	var fax = req.body.fax;
	var weburl = req.body.weburl;

	var hidden_field = req.body.hidden_field;

	if (hidden_field != "") {
		setting.update({
			company_name: companyname,
			contact_person: contactperson,
			address: address,
			country: country,
			city: city,
			state: state,
			postal_code: postalcode,
			phone_number: removePhoneMask(phnumber),
			mobile_number: removePhoneMask(mbnumber),
			email: email,
			fax: removePhoneMask(fax),
			website_url: weburl
		}, {
			where: {
				id: hidden_field
			}
		}).then(resp => {
			// res.end("success");
			req.flash('setting-message1', 'Settings Updated sucessfully.');
			res.redirect('/dashboard');
		});
	} else {
		setting.create({
			company_name: companyname,
			contact_person: contactperson,
			address: address,
			country: country,
			city: city,
			state: state,
			postal_code: postalcode,
			phone_number: removePhoneMask(phnumber),
			mobile_number: removePhoneMask(mbnumber),
			email: email,
			fax: removePhoneMask(fax),
			website_url: weburl
		}).then(resp => {
			req.flash('setting-message1', 'Settings Updated sucessfully.');
			res.redirect('/dashboard');
		});
	}
});


//============================


router.post('/client/findCityByState', auth, firmAttrAuth, csrfProtection, (req, res) => {

	City.findAll({
		where: {
			state: req.body.state
		}
	}).then(city => {
		res.json({
			city: city
		});
	});
});

router.post('/client/findPinByCity', auth, firmAttrAuth, csrfProtection, (req, res) => {
	city.findById(req.body.city_id).then(row => {
		// console.log(row.name);
		Zipcode.findAll({
			where: {
				city_name: row.name
			}
		}).then(pin => {
			console.log(JSON.stringify(pin, undefined, 2));
			// res.send(city);
			res.json({
				pin: pin
			});
		});
	});
});


/*==========================================Client route starts==============================================*/
router.get('/client', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var success_message = req.flash('success-message')[0];
	var success_edit_message = req.flash('success-edit-message')[0];
	var whereCondition = {};
	if (req.query.searchName) {
		whereCondition.client_type = req.query.searchName;
	}
	if (req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	if (req.user.firm_id) {
		whereCondition.firm_id = req.user.firm_id.toString();
	} else {
		whereCondition.firm_id = req.user.firm_id;
	}
	if (req.user.role_id != 2) {
		whereCondition.user_id = req.user.id;
	}

	const clientDetails = await client.findAll({
		where: {
			'attorney_id': req.user.id
		}
	});

	res.render('client/index', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		clients: clientDetails,
		searchName: req.query.searchName ? req.query.searchName : '',
		searchMail: req.query.searchEmail ? req.query.searchEmail : '',
		success_message,
		success_edit_message
	});
});

router.get('/client/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-client-message')[0];
	const designation = await Designation.findAll();
	const industry = await Industry.findAll();
	const country = await Country.findAll();
	const state = await State.findAll();
	const tags = await Tag.findAll();

	const attorney = await user.findAll({
		order: [
			['first_name', 'ASC']
		],

		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});

	res.render('client/addclient', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		tags: tags,
		country: country,
		state: state,
		designations: designation,
		industry: industry,
		attorney: attorney,
		error_message
	});
});


router.post('/client/multi-delete/', auth, firmAttrAuth, async (req, res) => {

	var client_ids = req.body.client_id;
	var n = req.body.client_id.length;
	for (i = 0; i < n; i++) {

		await client.destroy({
			where: {
				id: client_ids[i]
			}
		});
	}
	res.json({
		code: "200",
		message: 'Success'
	});
});

router.get('/client/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-clientEdit-message')[0];
	const clients = await client.findById(req.params['id']);
	const designations = await Designation.findAll();
	const tags = await Tag.findAll();

	const industrys = await Industry.findAll();
	const client_country = await Country.findAll();
	const attorney = await user.findAll({
		order: [
			['first_name', 'ASC']
		],


		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});
	const client_state = await State.findAll({
		where: {
			country_id: "233"
		}
	});
	var client_city = [];
	var client_zipcode = [];
	if (clients.state != null) {
		var client_city = await City.findAll({
			where: {
				state_id: clients.state.toString()
			}
		});
	}
	if (clients.city !== null) {
		var client_cities = await City.findById(clients.city.toString());
		var client_zipcode = await Zipcode.findAll({
			where: {
				city_name: client_cities.name
			}
		});
	}

	var existingTag = clients.tags;
	var existing_tag = existingTag.split(",");
	var existingTag = [];

	for (var i = 0; i < existing_tag.length; i++) {
		existingTag.push(Number(existing_tag[i]));
	}

	res.render('client/editclient', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		tags: tags,
		designation: designations,
		industry: industrys,
		client: clients,
		country: client_country,
		attorney: attorney,
		state: client_state,
		city: client_city,
		zipcode: client_zipcode,
		error_message,
		existing_tag: existingTag
	});
});

router.get('/client/view/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-clientEdit-message')[0];
	const clients = await client.findById(req.params['id']);
	const designations = await Designation.findAll();
	const tags = await Tag.findAll();
	const industrys = await Industry.findAll();
	const client_country = await Country.findAll();
	const attorney = await user.findAll({
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});
	const client_state = await State.findAll({
		where: {
			country_id: "233"
		}
	});
	var client_city = [];
	var client_zipcode = [];
	if (clients.state != null) {
		var client_city = await City.findAll({
			where: {
				state_id: clients.state.toString()
			}
		});
	}
	if (clients.city !== null) {
		var client_cities = await City.findById(clients.city.toString());
		var client_zipcode = await Zipcode.findAll({
			where: {
				city_name: client_cities.name
			}
		});
	}

	var existingTag = clients.tags;
	if (existingTag !== null) {
		var existing_tag = existingTag.split(",");
		var existingTag = [];

		for (var i = 0; i < existing_tag.length; i++) {
			+existingTag.push(Number(existing_tag[i]));
		}
	}

	res.render('client/viewClient', {
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		tags: tags,
		designation: designations,
		industry: industrys,
		client: clients,
		country: client_country,
		attorney: attorney,
		state: client_state,
		city: client_city,
		zipcode: client_zipcode,
		error_message,
		existing_tag: existingTag
	});
});

router.post('/client/addClient', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const formatDate = req.body.client_dob ? req.body.client_dob.split("-") : '';
	const client_data = await client.findOne({
		where: {
			email: req.body.email
		}
	});
	var tag_ids;
	if (req.body.tag_type === 'e') {
		tag_ids = req.body.existing_tags.toString();
	} else {
		var new_tags = req.body.add_new_tags;
		var all_tags = new_tags.split(",");
		for (i = 0; i < all_tags.length; i++) {
			await Tag.create({
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				tags: all_tags[i]
			}).then(result => {
				tag_ids += result.id + ',';
				//console.log(result.id);
			});
		}
		tag_ids = tag_ids.slice(0, -1);
	}
	if (client_data === null) {
		if (req.body.client_type === "O") {
			await client.create({
				organization_name: req.body.org_name,
				organization_id: req.body.org_id,
				organization_code: req.body.org_code,
				email: req.body.email,
				mobile_no: removePhoneMask(req.body.mobile_no),
				phone_no: removePhoneMask(req.body.phone_no),
				address1: req.body.address1,
				address2: req.body.address2,
				address_line_3: req.body.address3,
				country: req.body.country,
				state: req.body.state,
				city: req.body.city,
				pin_code: req.body.zipcode,
				designation_id: req.body.designation,
				attorney_id: req.body.attorney_id,
				tag_type: req.body.tag_type,
				tags: tag_ids,
				company_name: req.body.company_name,
				twitter: req.body.twitter,
				linkdn: req.body.linkdn,
				youtub: req.body.youtub,
				google: req.body.google,
				association_type: req.body.association,
				industry_type: req.body.industry_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				fax: removePhoneMask(req.body.fax),
				client_type: req.body.client_type,
				IM: req.body.im,
				social_url: req.body.social,
				website_url: req.body.website,
				remarks: req.body.remarks,
				current_revenue: removePhoneMask(req.body.current_revenue),
				estimated_revenue: removePhoneMask(req.body.estimated_revenue)
			});
			req.flash('success-message', 'Client Added Successfully');
			res.redirect('/client')
		} else {
			await client.create({
				first_name: req.body.client_first_name,
				last_name: req.body.client_last_name,
				email: req.body.email,
				mobile_no: removePhoneMask(req.body.mobile_no),
				phone_no: removePhoneMask(req.body.phone_no),
				address1: req.body.address1,
				address2: req.body.address2,
				address_line_3: req.body.address3,
				country: req.body.country,
				state: req.body.state,
				city: req.body.city,
				pin_code: req.body.zipcode,
				designation_id: req.body.designation,
				tag_type: req.body.tag_type,
				tags: tag_ids,
				attorney_id: req.body.attorney_id,
				company_name: req.body.company_name,
				twitter: req.body.twitter,
				linkdn: req.body.linkdn,
				youtub: req.body.youtub,
				google: req.body.google,
				association_type: req.body.association,
				industry_type: req.body.industry_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				fax: removePhoneMask(req.body.fax),
				client_type: req.body.client_type,
				IM: req.body.im,
				date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
				gender: req.body.client_gender,
				client_id: req.body.client_id,
				social_url: req.body.social,
				master_id: req.body.master_id,
				client_company: req.body.client_company,
				website_url: req.body.website,
				remarks: req.body.remarks,
				current_revenue: removePhoneMask(req.body.current_revenue),
				estimated_revenue: removePhoneMask(req.body.estimated_revenue)
			});
			req.flash('success-message', 'Client Added Successfully');
			res.redirect('/client')
		}
	} else {
		req.flash('error-client-message', 'Email already taken.');
		res.redirect('/client/add');
	}
});

router.post('/client/editClient/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {

	const formatDate = req.body.client_dob ? req.body.client_dob.split("-") : '';
	const client_edit_data = await client.findOne({
		where: {
			email: req.body.email,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	});

	var tag_ids;
	if (req.body.add_tag === 'e') {
		tag_ids = req.body.existing_tags.toString();
	} else {
		tag_ids = req.body.add_new_tags;
	}

	if (client_edit_data === null) {
		await client.update({
			organization_name: req.body.org_name,
			organization_id: req.body.org_id,
			organization_code: req.body.org_code,
			first_name: req.body.edit_client_first_name,
			last_name: req.body.edit_client_last_name,
			email: req.body.email,
			mobile_no: removePhoneMask(req.body.mobile_no),
			phone_no: removePhoneMask(req.body.phone_no),
			address1: req.body.address1,
			address2: req.body.address2,
			address_line_3: req.body.address3,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			pin_code: req.body.zipcode,
			designation_id: req.body.designation,
			attorney_id: req.body.attorney_id,
			tag_type: req.body.add_tag,
			tags: tag_ids,
			company_name: req.body.company_name,
			twitter: req.body.twitter,
			linkdn: req.body.linkdn,
			youtub: req.body.youtub,
			google: req.body.google,
			association_type: req.body.association,
			industry_type: req.body.industry_type,
			firm_id: req.user.firm_id,
			fax: removePhoneMask(req.body.fax),
			IM: req.body.im,
			date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
			gender: req.body.client_gender,
			client_id: req.body.client_id,
			master_id: req.body.master_id,
			client_company: req.body.client_company,
			remarks: req.body.remarks,
			social_url: req.body.social,
			website_url: req.body.website,
			current_revenue: req.body.current_revenue,
			estimated_revenue: req.body.estimated_revenue,

		}, {
			where: {
				id: req.params['id']
			}
		});
		req.flash('success-edit-message', 'Client Updated Successfully');
		res.redirect('/client')
	} else {
		req.flash('error-clientEdit-message', 'Email already taken.');
		res.redirect('/client/edit/' + req.params['id']);
	}
});

router.get('/client/delete/:id', auth, firmAttrAuth, (req, res) => {
	client.destroy({
		where: {
			id: req.params.id
		}
	}).then(resp => {
		req.flash('success-message', 'Client delete Successfully');
		res.redirect('/client');
	});
});

router.post('/client/findCityByState', auth, firmAttrAuth, csrfProtection, (req, res) => {

	City.findAll({
		where: {
			state_id: req.body.state_id
		}
	}).then(city => {
		res.json({
			city: city
		});
	});
});

router.post('/client/findPinByCity', auth, firmAttrAuth, csrfProtection, (req, res) => {
	city.findById(req.body.city_id).then(row => {
		Zipcode.findAll({
			where: {
				city_name: row.name
			}
		}).then(pin => {
			// console.log(JSON.stringify(pin, undefined, 2));
			res.json({
				pin: pin
			});
		});

	});


});


/*==========================================Client route ends==============================================*/

/*==========================================Import csv routes starts=========================================*/

router.get('/import/csv', auth, csrfProtection, (req, res) => {
	// var csv = fs.createReadStream("./"+"public/cities.csv");
	csv
		.fromPath("./public/states (1).csv")
		.on("data", function (data) {
			console.log(data[2]);
			state.create({
				id: data[0],
				code: data[1],
				name: data[2],
				country_id: data[3]
			}).then(result => {
				console.log("END");
			});
		})
		.on("end", function () {
			// console.log("done");

			res.redirect('/');
		});



});
/*==========================================Import csv routes ends=========================================*/


/*==========================Start practice area//Bratin Meheta 12-06-2018=============================*/

router.get('/practice-area', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-practiceArea-message')[0];
	var practiceAreaFilter = {};
	if (req.query.practice_area_code) {
		practiceAreaFilter.code = req.query.practice_area_code;
	}
	if (req.query.practice_area_name) {
		practiceAreaFilter.name = req.query.practice_area_name;
	}
	PracticeArea.findAll({
		where: practiceAreaFilter
	}).then(show => {
		res.render('practice_area/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			practice_area: show,
			practice_area_code: req.query.practice_area_code ? req.query.practice_area_code : '',
			practice_area_name: req.query.practice_area_name ? req.query.practice_area_name : ''
		});
	});
});

router.post('/practice-area/add', auth, siteAuth, csrfProtection, (req, res) => {
	PracticeArea.findAndCountAll({
		where: {
			name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			PracticeArea.create({
				code: req.body.code,
				name: req.body.name,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"a": 1
				});
			});
		} else {
			res.json({
				"a": 2
			});
		}
	});
});

router.post('/admin/edit-practice-area/:id', auth, siteAuth, csrfProtection, (req, res) => {
	PracticeArea.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(practice_area => {
		if (practice_area.length === 0) {
			PracticeArea.update({
				code: req.body.edit_code,
				name: req.body.edit_name,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"b": 1
				});
			});
		} else {

			res.json({
				"b": 2
			});
		}
	});
});

router.post('/admin/delete-practice-area/:id', auth, siteAuth, csrfProtection, (req, res) => {
	PracticeArea.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-practiceArea-message', 'Practice area delete Successfully');
		res.json({
			"c": 1
		});
	});
});

/*========================================End practice area========================================*/

/*==========================Start Section//Bratin Meheta 13-06-2018=============================*/

router.get('/section', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-section-message')[0];
	var sectionFilter = {};
	if (req.query.section_name) {
		sectionFilter.name = req.query.section_name;
	}
	Section.findAll({
		where: sectionFilter
	}).then(show => {
		res.render('section/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			section: show,
			section_name: req.query.section_name ? req.query.section_name : ''
		});
	});
});

router.post('/section/add', auth, siteAuth, csrfProtection, (req, res) => {
	Section.findAndCountAll({
		where: {
			name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			Section.create({
				name: req.body.name,
				description: req.body.description,
				remarks: req.body.remarks
			}).then(store => {
				// req.flash('success-activityGoal-message', 'Section Created Successfully');
				res.json({
					"add_section": 1
				});
			});
		} else {
			res.json({
				"add_section": 2
			});
		}
	});
});

router.post('/admin/edit-section/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Section.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(section => {
		if (section.length === 0) {
			Section.update({
				name: req.body.edit_name,
				description: req.body.edit_description,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_section": 1
				});
			});
		} else {

			res.json({
				"edit_section": 2
			});
		}
	});
});

router.post('/admin/delete-section/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Section.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-section-message', 'Section delete Successfully');
		res.json({
			"del_section": 1
		});
	});
});

/*========================================End section========================================*/

/*==========================Start Jurisdiction//Bratin Meheta 13-06-2018=============================*/

router.get('/jurisdiction', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-jurisdiction-message')[0];
	var whereCondition = {};
	if (req.query.jurisdiction_code) {
		whereCondition.code = req.query.jurisdiction_code;
	}
	if (req.query.jurisdiction_name) {
		whereCondition.name = req.query.jurisdiction_name;
	}
	Jurisdiction.findAll({
		where: whereCondition
	}).then(show => {
		res.render('jurisdiction/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			jurisdiction: show,
			jurisdiction_code: req.query.jurisdiction_code ? req.query.jurisdiction_code : '',
			jurisdiction_name: req.query.jurisdiction_name ? req.query.jurisdiction_name : ''
		});
	});
});

router.post('/jurisdiction/add', auth, siteAuth, csrfProtection, (req, res) => {
	Jurisdiction.findAndCountAll({
		where: {
			name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			Jurisdiction.create({
				code: req.body.code,
				name: req.body.name,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"add_jurisdiction": 1
				});
			});
		} else {
			res.json({
				"add_jurisdiction": 2
			});
		}
	});
});
router.post('/admin/edit-jurisdiction/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Jurisdiction.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(jurisdiction => {
		if (jurisdiction.length === 0) {
			Jurisdiction.update({
				code: req.body.edit_code,
				name: req.body.edit_name,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_jurisdiction": 1
				});
			});
		} else {

			res.json({
				"edit_jurisdiction": 2
			});
		}
	});
});

router.post('/admin/delete-jurisdiction/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Jurisdiction.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-jurisdiction-message', 'Jurisdiction delete Successfully');
		res.json({
			"del_jurisdiction": 1
		});
	});
});

/*========================================End Jurisdiction========================================*/

/*==========================Start Group//Bratin Meheta 13-06-2018=============================*/

router.get('/group', csrfProtection, auth, siteAuth, (req, res) => {
	var success_message = req.flash('success-group-message')[0];
	var whereCondition = {};
	if (req.query.group_code) {
		whereCondition.code = req.query.group_code;
	}
	if (req.query.group_name) {
		whereCondition.name = req.query.group_name;
	}
	Group.findAll({
		where: whereCondition
	}).then(show => {
		res.render('group/index', {
			layout: 'dashboard',
			success_message,
			csrfToken: req.csrfToken(),
			group: show,
			group_code: req.query.group_code ? req.query.group_code : '',
			group_name: req.query.group_name ? req.query.group_name : ''
		});
	});
});

router.post('/group/add', auth, siteAuth, csrfProtection, (req, res) => {
	Group.findAndCountAll({
		where: {
			name: req.body.name
		}
	}).then(result => {
		var count = result.count;
		if (count == 0) {
			Group.create({
				code: req.body.code,
				name: req.body.name,
				remarks: req.body.remarks
			}).then(store => {
				res.json({
					"add_group": 1
				});
			});
		} else {
			res.json({
				"add_group": 2
			});
		}
	});
});
router.post('/admin/edit-group/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Group.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(group => {
		if (group.length === 0) {
			Group.update({
				code: req.body.edit_code,
				name: req.body.edit_name,
				remarks: req.body.edit_remarks
			}, {
				where: {
					id: req.params['id']
				}
			}).then(result => {
				res.json({
					"edit_group": 1
				});
			});
		} else {

			res.json({
				"edit_group": 2
			});
		}
	});
});

router.post('/admin/delete-group/:id', auth, siteAuth, csrfProtection, (req, res) => {
	Group.destroy({
		where: {
			id: req.params['id']
		}
	}).then(result => {
		req.flash('success-group-message', 'Group delete Successfully');
		res.json({
			"del_group": 1
		});
	});
});

/*========================================End group========================================*/

/*============================Starts Import Client Excel Data =====================================*/
function convertToJSON(array) {
	var first = array[0].join()
	var headers = first.split(',');

	var jsonData = [];
	for (var i = 1, length = array.length; i < length; i++) {
		var myRow = array[i].join();
		var row = myRow.split(',');

		var data = {};
		for (var x = 0; x < row.length; x++) {
			data[headers[x]] = row[x];
		}
		jsonData.push(data);
	}
	return jsonData;
}

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

router.post('/client/upload-excel', auth, upload_client_excel.single('client_xls_file'), csrfProtection, async (req, res) => {
	var client_xl = xlsx.parse(fs.readFileSync('public/import-client-excel/' + fileName));
	var importedData = JSON.stringify(convertToJSON(client_xl[0].data));
	var excelClient = JSON.parse(importedData);
	for (var i = 0; i < excelClient.length; i++) {
		const formatDate = excelClient[i].dob ? excelClient[i].dob.split("-") : '';
		var excel_state = excelClient[i].state.capitalize();
		var excel_city = excelClient[i].city.capitalize();
		var excel_zip = excelClient[i].zipcode.capitalize();
		var fetchState = [];
		var fetchCity = [];
		var fetchZip = [];
		if (excelClient[i].state !== null) {
			var fetchState = await State.findAll({
				where: {
					name: excel_state
				}
			});
		}
		if (excelClient[i].city !== null) {
			var fetchCity = await City.findAll({
				where: {
					name: excel_city
				}
			});
		}
		if (excelClient[i].zipcode !== null) {
			var fetchZip = await Zipcode.findAll({
				where: {
					zip: excel_zip
				}
			});
		}
		const client_excel_data = await client.findOne({
			where: {
				email: excelClient[i].email
			}
		});
		if (client_excel_data === null) {
			if (excelClient[i].client_type == "organization") {
				await client.create({
					organization_name: excelClient[i].oraganisation_name,
					organization_id: excelClient[i].organisation_id,
					organization_code: excelClient[i].organisation_code,
					email: excelClient[i].email,
					mobile_no: excelClient[i].mobile,
					address1: excelClient[i].address1,
					address2: excelClient[i].address2,
					address_line_3: excelClient[i].address3,
					company_name: excelClient[i].company_name,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					fax: excelClient[i].fax,
					twitter: `http://${excelClient[i].twitter}`,
					linkdn: `http://${excelClient[i].linkdn}`,
					facebook: `http://${excelClient[i].facebook}`,
					google: `http://${excelClient[i].google}`,
					client_type: "O",
					IM: excelClient[i].im,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					pin_code: fetchZip[0].id,
					remarks: excelClient[i].edit_remarks
				});
			} else {
				await client.create({
					first_name: excelClient[i].first_name,
					last_name: excelClient[i].last_name,
					email: excelClient[i].email,
					mobile_no: excelClient[i].mobile,
					address1: excelClient[i].address1,
					address2: excelClient[i].address2,
					address_line_3: excelClient[i].address3,
					company_name: excelClient[i].company_name,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					fax: excelClient[i].fax,
					twitter: `http://${excelClient[i].twitter}`,
					linkdn: `http://${excelClient[i].linkdn}`,
					facebook: `http://${excelClient[i].facebook}`,
					google: `http://${excelClient[i].google}`,
					client_type: "I",
					IM: excelClient[i].im,
					date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
					gender: excelClient[i].gender,
					client_id: excelClient[i].client_id,
					master_id: excelClient[i].master_id,
					client_company: excelClient[i].client_company,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					pin_code: fetchZip[0].id,
					remarks: excelClient[i].remarks
				});
			}
		}
	}
	req.flash('success-message', 'Client Imported Successfully');
	res.redirect('/client');
});

/*============================Ends Import Client Excel Data =====================================*/
module.exports = router;