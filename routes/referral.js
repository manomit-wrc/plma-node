const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const Client = require('../models').client;
const Target = require('../models').target;
const Referral = require('../models').referral;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const industry_type = require('../models').industry_type;
const Activity = require('../models').activity;
const TargetActivity = require('../models').jointactivity;
var fs = require('fs');
const multer = require('multer');
var xlsx = require('node-xlsx');
const ContactInformation = require('../models').contact_information;

var csrfProtection = csrf({
	cookie: true
});
const router = express.Router();
var fileExt = '';
var fileName = '';

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/import-referral-excel');
	},
	filename: function (req, file, cb) {
		fileExt = 'xlsx';
		fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
		cb(null, fileName);
	}
})
var referral_xcel = multer({
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

router.get('/referral', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var success_message = req.flash('success-ref-message')[0];
	var successEdit_message = req.flash('success-refEdit-message')[0];
	var successDel_message = req.flash('success_delete_referral')[0];
	var fetchTarget = {};
	var fetchClient = {};
	if (req.user.role_id != 2) {
		fetchTarget.attorney_id = req.user.id;
		fetchTarget.firm_id = req.user.firm_id;
		fetchTarget.target_status = 1;
		fetchClient.attorney_id = req.user.id;
		fetchClient.firm_id = req.user.firm_id;
	} else {
		fetchTarget.target_status = 1;
		fetchTarget.firm_id = req.user.firm_id;
		fetchClient.firm_id = req.user.firm_id;
	}

	var industry = await industry_type.findAll();
	var country = await Country.findAll();
	const attorney = await User.findAll({
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});
	const state = await State.findAll({
		where: {
			country_id: "233"
		}
	});
	const client = await Client.findAll({
		order: [
			['first_name', 'ASC'],
		],
		where: fetchClient
	});

	const target = await Target.findAll({

		order: [
			['first_name', 'ASC'],
		],
		where: fetchTarget
	});
	var whereCondition = {};
	if (req.query.referral_type) {
		whereCondition.referral_type = req.query.referral_type;
	}
	if (req.query.industry_type) {
		whereCondition.industry_type = req.query.industry_type;
	}
	if (req.query.association) {
		whereCondition.association = req.query.association;
	}
	if (req.query.country) {
		whereCondition.country = req.query.country;
	}
	if (req.query.attorney) {
		whereCondition.attorney_id = req.query.attorney;
	}
	if (req.query.ref_type && req.query.referred_id_t || req.query.referred_id_c) {
		whereCondition.referred_type = req.query.ref_type;
		if (req.query.referred_id_t) {
			whereCondition.target_id = req.query.referred_id_t;
		}
		if (req.query.referred_id_c) {
			whereCondition.client_id = req.query.referred_id_c;
		}
	}
	if (req.query.state) {
		var city = await City.findAll({
			where: {
				state_id: req.query.state
			}
		});
		whereCondition.state = req.query.state;
	}
	if (req.query.city) {
		const cities = await City.findById(req.query.city);
		var zipcode = await Zipcode.findAll({
			where: {
				city_name: cities.name
			}
		});
		whereCondition.city = req.query.city;
	}
	if (req.query.zipcode) {
		whereCondition.zipcode = req.query.zipcode;
	}
	whereCondition.firm_id = req.user.firm_id;
	if (req.user.role_id != 2) {
		whereCondition.attorney_id = req.user.id;
	}

	const referral = await Referral.findAll({
		where: whereCondition
	});

	res.render('referral/index', {
		layout: 'dashboard',
		title: 'Referral Sources Listing',
		success_message,
		referral,
		successEdit_message,
		successDel_message,
		industry,
		country,
		state,
		attorney,
		client,
		target,
		searchName: req.query.searchName ? req.query.searchName : '',
		searchMail: req.query.searchEmail ? req.query.searchEmail : '',
		count_query: Object.keys(req.query).length,
		industry_type: req.query.industry_type ? req.query.industry_type : "",
		association: req.query.association ? req.query.association : "",
		country_search: req.query.country ? req.query.country : "",
		state_search: req.query.state ? req.query.state : "",
		city_search: req.query.city ? req.query.city : "",
		zipcode_search: req.query.zipcode ? req.query.zipcode : "",
		attr_search: req.query.attorney ? req.query.attorney : "",
		referral_type_search: req.query.referral_type ? req.query.referral_type : "",
		ref_type_search: req.query.ref_type ? req.query.ref_type : "",
		referred_id_t_search: req.query.referred_id_t ? req.query.referred_id_t : "",
		referred_id_c_search: req.query.referred_id_c ? req.query.referred_id_c : "",
		city,
		zipcode
	});
});

router.get('/referral/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var err_message = req.flash('error-referral-message')[0];
	var industry = await industry_type.findAll({
		order: [
			['industry_name', 'ASC'],
		],
	});
	var country = await Country.findAll();
	var fetchTarget = {};
	var fetchClient = {};
	if (req.user.role_id != 2) {
		fetchTarget.attorney_id = req.user.id;
		fetchTarget.firm_id = req.user.firm_id;
		fetchTarget.target_status = 1;
		fetchClient.attorney_id = req.user.id;
		fetchClient.firm_id = req.user.firm_id;
	} else {
		fetchTarget.target_status = 1;
		fetchTarget.firm_id = req.user.firm_id;
		fetchClient.firm_id = req.user.firm_id;
	}

	const attorney = await User.findAll({
		order: [
			['first_name', 'ASC'],
		],
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});

	const state = await State.findAll({
		where: {
			country_id: "233"
		}
	});

	const client = await Client.findAll({
		order: [
			['first_name', 'ASC'],
		],


		where:fetchClient
	});

	const target = await Target.findAll({

		order: [
			['first_name', 'ASC'],
		],


		where: fetchTarget
	});

	res.render('referral/add', {
		layout: 'dashboard',
		title: 'Add Referral Source',
		csrfToken: req.csrfToken(),
		attorney,
		client,
		country,
		state,
		industry,
		target,
		err_message,
	});
});

router.post('/referral/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var clientDetails = [];
	var first_name = req.body.clientDetailsFirstName;
	var last_name = req.body.clientDetailsSecondName;
	var gender = req.body.clientDetailsGender;
	var email = req.body.clientDetailsEmail;
	var phone_no = req.body.clientDetailsPhone_no;
	var fax = req.body.clientDetailsFax;
	var mobile_no = req.body.clientDetailsMobile_no;

	const closingDate = req.body.revenueclosingDate ? req.body.revenueclosingDate.split("-") : '';

	let length = first_name.length;
	for (let i = 0; i < length; i++) {
		if (first_name[i] !== "") {
			clientDetails.push({
				"first_name": first_name[i],
				"last_name": last_name[i],
				"gender": gender[i],
				"email": email[i],
				"phone_no": removePhoneMask(phone_no[i]),
				"fax": removePhoneMask(fax[i]),
				"mobile_no": removePhoneMask(mobile_no[i])
			});
		}
	}

	const ref_email = await Referral.findOne({
		where: {
			email: req.body.email
		}
	});

	if (ref_email === null) {
		if (req.body.referral_type == "I") {
			await Referral.create({
				referral_type: req.body.referral_type,
				attorney_id: parseInt(req.body.attr_id),
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				mobile: removePhoneMask(req.body.mobile_no),
				// referred_type: req.body.ref_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				// target_id: req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				// client_id: req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0,
				remarks: req.body.remarks,
				gender: req.body.gender,
				// estimated_revenue: removePhoneMask(req.body.estimated_revenue),
				address1: req.body.address1,
				address2: req.body.address2,
				address3: req.body.address3,
				city: req.body.city,
				state: req.body.state,
				country: req.body.country,
				zipcode: req.body.zipcode,
				address_remarks: req.body.address_remarks,
				company_name: req.body.company_name,
				website_url: req.body.website_url,
				fax: removePhoneMask(req.body.fax),
				phone_no: removePhoneMask(req.body.phone_no),
				im: req.body.im,
				twitter: req.body.twitter,
				linkedin: req.body.linkedin,
				social_url: req.body.social_url,
				google: req.body.google,
				youtube: req.body.youtube,
				association: req.body.association,
				industry_type: req.body.industry_type,
				revenueclosingDate: closingDate ? closingDate[2] + "-" + closingDate[1] + "-" + closingDate[0] : null
			});
		} else {
			const insertData = await Referral.create({
				referral_type: req.body.referral_type,
				attorney_id: parseInt(req.body.attr_id),
				organization_name: req.body.org_name,
				email: req.body.email,
				mobile: removePhoneMask(req.body.mobile_no),
				// referred_type: req.body.ref_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				// target_id: req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				// client_id: req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0,
				remarks: req.body.remarks,
				gender: req.body.gender,
				// estimated_revenue: removePhoneMask(req.body.estimated_revenue),
				address1: req.body.address1,
				address2: req.body.address2,
				address3: req.body.address3,
				city: req.body.city,
				state: req.body.state,
				country: req.body.country,
				zipcode: req.body.zipcode,
				address_remarks: req.body.address_remarks,
				company_name: req.body.company_name,
				website_url: req.body.website_url,
				fax: removePhoneMask(req.body.fax),
				phone_no: removePhoneMask(req.body.phone_no),
				im: req.body.im,
				twitter: req.body.twitter,
				linkedin: req.body.linkedin,
				social_url: req.body.social_url,
				google: req.body.google,
				youtube: req.body.youtube,
				association: req.body.association,
				industry_type: req.body.industry_type,
				revenueclosingDate: closingDate ? closingDate[2] + "-" + closingDate[1] + "-" + closingDate[0] : null
			});

			for (let j = 0; j < clientDetails.length; j++) {
				await ContactInformation.create({
					first_name: clientDetails[j].first_name,
					last_name: clientDetails[j].last_name,
					gender: clientDetails[j].gender,
					email: clientDetails[j].email,
					mobile_no: clientDetails[j].mobile_no,
					phone_no: clientDetails[j].phone_no,
					fax: clientDetails[j].fax,
					type: 'M',
					contact_id: insertData.id
				});
			}
		}

		req.flash('success-ref-message', 'Referral Created Successfully');
		res.redirect("/referral");
	} else {
		req.flash('error-referral-message', 'Email already taken.');
		res.redirect('/referral/add');
	}
});



router.get('/referral/view/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const referral = await Referral.findById(req.params['id']);
	const attorney = await User.findAll({
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});
	const industry = await industry_type.findAll();
	const client = await Client.findAll({
		where: {
			attorney_id: req.user.id
		}
	});
	const target = await Target.findAll({
		where: {
			attorney_id: req.user.id
		}
	});
	const country = await Country.findAll();
	const state = await State.findAll({
		where: {
			country_id: "233"
		}
	});
	const city = await City.findAll({
		where: {
			state_id: referral.state.toString()
		}
	});
	const cities = await City.findById(referral.city.toString());
	const zipcode = await Zipcode.findAll({
		where: {
			city_name: cities.name
		}
	});

	const contactDetails = await ContactInformation.findAll({
		where: {
			'contact_id': req.params['id']
		}
	});
	TargetActivity.belongsTo(Activity, {
		foreignKey: 'activity_id'
	});
	const activity_details = await TargetActivity.findAll({
		where: {
			target_client_type: "R",
			type: req.params['id']
		},
		include: [{
			model: Activity
		}]
	});
	res.render('referral/view', {
		layout: 'dashboard',
		title: 'View Referral Source',
		industry,
		country,
		state,
		city,
		zipcode,
		csrfToken: req.csrfToken(),
		referral,
		attorney,
		client,
		target,
		contactDetails,
		activity_details
	});
});

router.get('/referral/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var err_message = req.flash('error-referral-message')[0];
	const referral = await Referral.findById(req.params['id']);
	const country = await Country.findAll();
	const industry = await industry_type.findAll({
		order: [
			['industry_name', 'ASC'],
		],
	});
	const cities = await City.findById(referral.city.toString());

	var fetchTarget = {};
	var fetchClient = {};


	if (req.user.role_id != 2) {
		fetchTarget.attorney_id = req.user.id;
		fetchTarget.firm_id = req.user.firm_id;
		fetchTarget.target_status = 1;
		fetchClient.attorney_id = req.user.id;
		fetchClient.firm_id = req.user.firm_id;
	} else {
		fetchTarget.firm_id = req.user.firm_id;
		fetchClient.firm_id = req.user.firm_id;
	}

	const attorney = await User.findAll({
		order: [
			['first_name', 'ASC'],
		],
		where: {
			role_id: 3,
			firm_id: req.user.firm_id
		}
	});
	const client = await Client.findAll({
		order: [
			['first_name', 'ASC'],
		],


		where: fetchClient
	});
	const target = await Target.findAll({

		order: [
			['first_name', 'ASC'],
		],

		where: fetchTarget
	});


	const state = await State.findAll({
		where: {
			country_id: "233"
		}
	});

	const city = await City.findAll({
		where: {
			state_id: referral.state.toString()
		}
	});

	const zipcode = await Zipcode.findAll({
		where: {
			city_name: cities.name
		}
	});

	const contactDetails = await ContactInformation.findAll({
		where: {
			'contact_id': req.params['id']
		}
	});

	res.render('referral/edit', {
		layout: 'dashboard',
		title: 'Edit Referral Source',
		industry,
		country,
		state,
		city,
		zipcode,
		csrfToken: req.csrfToken(),
		referral,
		attorney,
		client,
		target,
		err_message,
		contactDetails
	});
});

router.post('/referral/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var contactDetails = [];
	var first_name = req.body.contactDetailsFirstName;
	var last_name = req.body.contactDetailsSecondName;
	var gender = req.body.contactDetailsGender;
	var email = req.body.contactDetailsEmail;
	var phone_no = req.body.contactDetailsPhone_no;
	var fax = req.body.contactDetailsFax;
	var mobile_no = req.body.contactDetailsMobile_no;

	const closingDate = req.body.revenueclosingDate ? req.body.revenueclosingDate.split("-") : '';

	let length = first_name.length;
	for (let i = 0; i < length; i++) {
		if (first_name[i] !== "") {
			contactDetails.push({
				"first_name": first_name[i],
				"last_name": last_name[i],
				"gender": gender[i],
				"email": email[i],
				"phone_no": removePhoneMask(phone_no[i]),
				"fax": removePhoneMask(fax[i]),
				"mobile_no": removePhoneMask(mobile_no[i])
			});
		}
	}


	const edit_data = await Referral.findOne({
		where: {
			email: req.body.email,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	});

	if (edit_data === null) {
		await Referral.update({
			referral_type: req.body.referral_type,
			attorney_id: parseInt(req.body.attr_id),
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			organization_name: req.body.org_name,
			email: req.body.email,
			mobile: removePhoneMask(req.body.mobile_no),
			// referred_type: req.body.ref_type,
			gender: req.body.gender,
			// estimated_revenue: removePhoneMask(req.body.estimated_revenue),
			address1: req.body.address1,
			address2: req.body.address2,
			address3: req.body.address3,
			city: req.body.city,
			state: req.body.state,
			country: req.body.country,
			zipcode: req.body.zipcode,
			address_remarks: req.body.address_remarks,
			company_name: req.body.company_name,
			website_url: req.body.website_url,
			fax: removePhoneMask(req.body.fax),
			phone_no: removePhoneMask(req.body.phone_no),
			im: req.body.im,
			twitter: req.body.twitter,
			linkedin: req.body.linkedin,
			social_url: req.body.social_url,
			google: req.body.google,
			youtube: req.body.youtube,
			association: req.body.association,
			industry_type: req.body.industry_type,
			remarks: req.body.remarks,
			revenueclosingDate: closingDate ? closingDate[2] + "-" + closingDate[1] + "-" + closingDate[0] : null
		}, {
			where: {
				id: req.params['id']
			}
		});

		await ContactInformation.destroy({
			where: {
				contact_id: req.params['id']
			}
		});

		for (let j = 0; j < contactDetails.length; j++) {
			await ContactInformation.create({
				first_name: contactDetails[j].first_name,
				last_name: contactDetails[j].last_name,
				gender: contactDetails[j].gender,
				email: contactDetails[j].email,
				mobile_no: contactDetails[j].mobile_no,
				phone_no: contactDetails[j].phone_no,
				fax: contactDetails[j].fax,
				type: 'M',
				contact_id: req.params['id']
			});
		}

		if (req.body.ref_type == "T") {
			await Referral.update({
				target_id: req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				client_id: 0
			}, {
				where: {
					id: req.params['id']
				}
			});
		} else {
			await Referral.update({
				target_id: 0,
				client_id: req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0
			}, {
				where: {
					id: req.params['id']
				}
			});
		}
		req.flash('success-refEdit-message', 'Referral Updated Successfully');
		res.redirect("/referral");
	} else {
		req.flash('error-referral-message', 'Email already taken.');
		res.redirect('/referral/edit/' + req.params['id']);
	}
});

router.get('/referral/delete/:id', auth, firmAttrAuth, (req, res) => {
	Referral.destroy({
		where: {
			id: req.params.id
		}
	}).then(resp => {
		req.flash('success_delete_referral', 'Referral deleted successfully');
		res.redirect('/referral');
	});
});

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

router.post('/referral/upload-excel', auth, referral_xcel.single('ref_excel_file'), async (req, res) => {
	var referral_excel = xlsx.parse(fs.readFileSync('public/import-referral-excel/' + fileName));
	var importedData = JSON.stringify(convertToJSON(referral_excel[0].data));
	var excelReferral = JSON.parse(importedData);
	for (var i = 0; i < excelReferral.length; i++) {
		var attr = excelReferral[i].attorney_email;
		var target = excelReferral[i].target_email;
		var client = excelReferral[i].client_email;
		var attr_id = [];
		var target_id = [];
		var client_id = [];
		if (attr !== null) {
			var attr_id = await User.findAll({
				where: {
					email: attr
				}
			});
		}
		if (target) {
			var target_id = await Target.findAll({
				where: {
					email: target
				}
			});
		}
		if (client) {
			var client_id = await Client.findAll({
				where: {
					email: client
				}
			});
		}
		try {
			var targetID = target_id[0].id;
		} catch (ex) {
			var targetID = null;
		}
		try {
			var clientID = client_id[0].id;
		} catch (ex) {
			var clientID = null;
		}
		try {
			var attrID = attr_id[0].id;
		} catch (ex) {
			var attrID = null;
		}

		var excel_state = excelReferral[i].state.capitalize();
		var excel_city = excelReferral[i].city.capitalize();
		var excel_zip = excelReferral[i].zipcode.capitalize();
		var fetchState = [];
		var fetchCity = [];
		var fetchZip = [];
		if (excelReferral[i].state !== null) {
			var fetchState = await State.findAll({
				where: {
					name: excel_state
				}
			});
		}
		if (excelReferral[i].city !== null) {
			var fetchCity = await City.findAll({
				where: {
					name: excel_city
				}
			});
		}
		if (excelReferral[i].zipcode !== null) {
			var fetchZip = await Zipcode.findAll({
				where: {
					zip: excel_zip
				}
			});
		}
		const referral_excel_data = await Referral.findOne({
			where: {
				email: excelReferral[i].email
			}
		});
		if (referral_excel_data === null) {
			if (excelReferral[i].referral_type == "Individual") {
				var store_excel = await Referral.create({
					referral_type: "I",
					attorney_id: attrID,
					first_name: excelReferral[i].first_name,
					last_name: excelReferral[i].last_name,
					email: excelReferral[i].email,
					mobile: excelReferral[i].mobile,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					address1: excelReferral[i].address1,
					address2: excelReferral[i].address2,
					address3: excelReferral[i].address3,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					zipcode: fetchZip[0].id,
					remarks: excelReferral[i].remarks
				});
			} else if (excelReferral[i].referral_type == "Organization") {
				var store_excel = await Referral.create({
					referral_type: "O",
					attorney_id: attrID,
					organization_name: excelReferral[i].organization_name,
					email: excelReferral[i].email,
					mobile: excelReferral[i].mobile,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					address1: excelReferral[i].address1,
					address2: excelReferral[i].address2,
					address3: excelReferral[i].address3,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					zipcode: fetchZip[0].id,
					remarks: excelReferral[i].remarks
				});
			}
			if (store_excel) {
				if (excelReferral[i].referred_type == "target") {
					await Referral.update({
						referred_type: "T",
						target_id: targetID,
						client_id: 0
					}, {
						where: {
							id: store_excel.id
						}
					});
				} else if (excelReferral[i].referred_type == "client") {
					await Referral.update({
						referred_type: "C",
						client_id: clientID,
						target_id: 0
					}, {
						where: {
							id: store_excel.id
						}
					});
				}
			}
		}
	}
	req.flash('success-ref-message', 'Referral Imported Successfully');
	res.redirect('/referral');
});

// start all associated activities

router.get("/referral/view-activity/:id", auth, async (req, res) => {
	TargetActivity.belongsTo(Activity, {
		foreignKey: 'activity_id'
	});
	const activity_details = await TargetActivity.findAll({
		where: {
			target_client_type: "R",
			type: req.params['id']
		},
		include: [{
			model: Activity
		}]
	});
	res.render("referral/view_activity", {
		layout: 'dashboard',
		title: 'View Activity',
		activity_details
	});
});


router.post('/referral/multi-delete/', auth, firmAttrAuth, async (req, res) => {
	var referral_ids = req.body.referral_id;
	var n = req.body.referral_id.length;

	for (i = 0; i < n; i++) {
		await Referral.destroy({
			where: {
				id: referral_ids[i]
			}
		});
	}
	res.json({
		code: "200",
		message: 'Success'
	});
});






/**************************** Start Reffered Client Target ********************************************/



/**************************** End Reffered Client Target ********************************************/


module.exports = router;
