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
const multer = require('multer');
const xlsx = require('node-xlsx');
const PracticeArea = require('../models').practicearea;
const Section = require('../models').section;
const Group = require('../models').group;
const budget = require('../models').budget;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const industry_type = require('../models').industry_type;
const setting = require('../models').setting;
const Target = require('../models').target;
const Client = require('../models').client;
const Jurisdiction = require('../models').jurisdiction;
const user = require('../models').user;
var csrfProtection = csrf({ cookie: true });
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
const router = express.Router();

var fileExt = '';
var fileName = '';

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/target');
	},
	filename: function (req, file, cb) {
		fileExt = file.originalname.split('.')[1];
		fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
		cb(null, fileName);
	}
})

var upload = multer({ storage: storage });

function removePhoneMask(phone_no) {
	var phone_no = phone_no.replace("-","");
	phone_no = phone_no.replace(")","");
	phone_no = phone_no.replace("(","");
	phone_no = phone_no.replace(" ","");
	return phone_no;
}

router.get('/target', auth, firmAttrAuth, csrfProtection, (req, res) => {
	var success_message = req.flash('success-message')[0];
	var success_edit_message = req.flash('success-edit-message')[0];
	var whereCondition = {};
	if (req.query.searchName) {
		whereCondition.target_type = req.query.searchName;
	}
	if (req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	whereCondition.firm_id = req.user.firm_id.toString();
	if (req.user.role_id != 2) {
		whereCondition.user_id = req.user.id;
	}
	whereCondition.status = '1';
	Target.findAll({
		where: whereCondition
	}).then(targets => {
		res.render('target/targets', { 
			layout: 'dashboard',  
			csrfToken: req.csrfToken(),
			targets: targets, 
			searchName: req.query.searchName ? req.query.searchName : '', 
			searchMail: req.query.searchEmail ? req.query.searchEmail : '', 
			success_message, 
			success_edit_message
		});
	});
});

router.get('/target/add', auth, firmAttrAuth, csrfProtection, (req, res) => {
	var error_message = req.flash('error-target-message')[0];
	designation.findAll().then(designation => {
		industry_type.findAll().then(industry => {
			Country.findAll().then(country => {
				State.findAll().then(state => {
					res.render('target/addtarget',{ layout: 'dashboard', csrfToken: req.csrfToken(), country: country, state: state, designations: designation, industry: industry, error_message  });
				});
			});
		});
	});
});

router.post('/target/addtarget', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const formatDate = req.body.target_dob ? req.body.target_dob.split("-") : '';
	const target_data = await Target.findOne({
		where: {
			email: req.body.email
		}
	});
	if (target_data === null) {
		if (req.body.target_type === "O") {
			const store_org_data = await Target.create({
				organization_name: req.body.org_name,
				organization_id: req.body.org_id,
				organization_code: req.body.org_code,
				email: req.body.email,
				mobile_no: removePhoneMask(req.body.mobile_no),
				address_1: req.body.address1,
				address_2: req.body.address2,
				address3: req.body.address3,
				country: req.body.country,
				state: req.body.state,
				city: req.body.city,
				postal_code: req.body.zipcode,
				designation_id: req.body.designation,
				company_name: req.body.company_name,
				twitter: req.body.twitter,
				linked_in: req.body.linkdn,
				facebook: req.body.facebook,
				google: req.body.google,
				association: req.body.association,
				industry_type: req.body.industry_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				fax: removePhoneMask(req.body.fax),
				target_type: req.body.target_type,
				im: req.body.im,
				social_sequrity_no: removePhoneMask(req.body.social_sec_no),
				remarks: req.body.remarks
			});
			req.flash('success-message', 'Target Added Successfully');
			res.redirect('/target');
		} else {
			const store_ind_data = await Target.create({
				first_name: req.body.target_first_name,
				last_name: req.body.target_last_name,
				email: req.body.email,
				mobile_no: removePhoneMask(req.body.mobile_no),
				address_1: req.body.address1,
				address_2: req.body.address2,
				address3: req.body.address3,
				country: req.body.country,
				state: req.body.state,
				city: req.body.city,
				postal_code: req.body.zipcode,
				designation_id: req.body.designation,
				company_name: req.body.company_name,
				twitter: req.body.twitter,
				linked_in: req.body.linkdn,
				facebook: req.body.facebook,
				google: req.body.google,
				association: req.body.association,
				industry_type: req.body.industry_type,
				firm_id: req.user.firm_id,
				user_id: req.user.id,
				fax: removePhoneMask(req.body.fax),
				target_type: req.body.target_type,
				im: req.body.im,
				social_sequrity_no: removePhoneMask(req.body.social_sec_no),
				date_of_birth: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
				gender: req.body.target_gender,
				target_id : req.body.target_id,
				target_code : req.body.master_id,
				remarks: req.body.remarks
			});
			req.flash('success-message', 'Target Added Successfully');
			res.redirect('/target')
		}
	} else {
		req.flash('error-target-message', 'Email already taken.');
		res.redirect('/target/add');
	}
});

router.get('/target/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-clientEdit-message')[0];
	const clients = await Target.findById(req.params['id']);
	const designations = await designation.findAll();
	const industrys = await industry_type.findAll();
	const client_country = await Country.findAll();
	const client_state = await State.findAll({
		where: { country_id : "233" }
	});
	const client_city = await City.findAll({
		where: {
			state_id : clients.state.toString()
		}
	});
	const client_cities = await City.findById(clients.city.toString());
	const client_zipcode = await Zipcode.findAll({
		where: {
			city_name: client_cities.name
		}
	});
	res.render('target/targetupdate', { layout: 'dashboard', csrfToken: req.csrfToken(), designation: designations, industry: industrys, client:clients, country: client_country, state: client_state, city: client_city, zipcode: client_zipcode, error_message });
});

router.post('/target/edittarget/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const formatDate = req.body.client_dob ? req.body.client_dob.split("-") : '';
	const target_edit_data = await Target.findOne({
		where: {
			email: req.body.email,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	});
	if (target_edit_data === null) {
		const edit_client = await Target.update({
			organization_name: req.body.org_name,
			organization_id: req.body.org_id,
			organization_code: req.body.org_code,
			first_name: req.body.edit_target_first_name,
			last_name: req.body.edit_target_last_name,
			email: req.body.email,
			mobile_no: removePhoneMask(req.body.mobile_no),
			address_1: req.body.address1,
			address_2: req.body.address2,
			address3: req.body.address3,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			postal_code: req.body.zipcode,
			designation_id: req.body.designation,
			company_name: req.body.company_name,
			twitter: req.body.twitter,
			linked_in: req.body.linkdn,
			facebook: req.body.facebook,
			google: req.body.google,
			association: req.body.association,
			industry_type: req.body.industry_type,
			firm_id: req.user.firm_id,
			fax: removePhoneMask(req.body.fax),
			im: req.body.im,
			social_sequrity_no: removePhoneMask(req.body.social_sec_no),
			date_of_birth: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
			gender: req.body.client_gender,
			target_id : req.body.client_id,
			target_code : req.body.master_id,
			remarks: req.body.remarks
			}, {where: {id: req.params['id']}
		});
		req.flash('success-edit-message', 'Target Updated Successfully');
		res.redirect('/target')
	} else {
		req.flash('error-clientEdit-message', 'Email already taken.');
		res.redirect('/target/edit/'+req.params['id']);
	}
});

router.get('/target/delete/:id', auth, firmAttrAuth, (req, res) => {
	Target.destroy({
		where: {
			id: req.params.id
		}
	}).then(resp => {
		// req.flash('success_delete_attorney','Attorney deleted successfully');
		res.redirect('/target');
	});
});

function convertToJSON(array) {
	var first = array[0].join()
	var headers = first.split(',');
	var jsonData = [];
	for ( var i = 1, length = array.length; i < length; i++ ) {
		var myRow = array[i].join();
		var row = myRow.split(',');
		var data = {};
		for ( var x = 0; x < row.length; x++ ) {
			data[headers[x]] = row[x];
		}
		jsonData.push(data);
	}
	return jsonData;
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

router.post('/target/import', auth, upload.single('file_name'), csrfProtection, async (req, res) => {
	var target_xl = xlsx.parse(fs.readFileSync('public/target/' + fileName));
	var importedData = JSON.stringify(convertToJSON(target_xl[0].data));
	var excelTarget = JSON.parse(importedData);
	for (var i = 0; i < excelTarget.length; i++) {
		const formatDate = excelTarget[i].dob ? excelTarget[i].dob.split("-") : '';
		var excel_state = excelTarget[i].state.capitalize();
		var excel_city = excelTarget[i].city.capitalize();
		var excel_zip = excelTarget[i].zipcode.capitalize();
		var fetchState = [];
		var fetchCity = [];
		var fetchZip = [];
		if (excelTarget[i].state !== null) {
			var fetchState = await State.findAll({
				where: { name: excel_state }
			});
		}
		if (excelTarget[i].city !== null) {
			var fetchCity = await City.findAll({
				where: { name: excel_city }
			});
		}
		if (excelTarget[i].zipcode !== null) {
			var fetchZip = await Zipcode.findAll({
				where: { zip: excel_zip }
			});
		}
		const target_excel_data = await Target.findOne({
			where: {
				email: excelTarget[i].email
			}
		});
		if (target_excel_data === null) {
			if (excelTarget[i].target_type == "organization") {
				const storeTargetXlO = await Target.create({
					organization_name: excelTarget[i].oraganisation_name,
					organization_id: excelTarget[i].organisation_id,
					organization_code: excelTarget[i].organisation_code,
					email: excelTarget[i].email,
					mobile_no: excelTarget[i].mobile,
					fax: excelTarget[i].fax,
					address_1: excelTarget[i].address_1,
					address_2: excelTarget[i].address_2,
					address3: excelTarget[i].address3,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					pin_code: fetchZip[0].id,
					IM: excelTarget[i].im,
					company_name: excelTarget[i].company_name,
					social_security_no: excelTarget[i].social_security_no,
					twitter: `http://${excelTarget[i].twitter}`,
					linked_in: `http://${excelTarget[i].linked_in}`,
					facebook: `http://${excelTarget[i].facebook}`,
					google: `http://${excelTarget[i].google}`,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					target_type: "O",
					remarks: excelTarget[i].edit_remarks
				});
			} else {
				const storeTargetXlI = await Target.create({
					first_name: excelTarget[i].first_name,
					last_name: excelTarget[i].last_name,
					target_id: excelTarget[i].target_id,
					target_code: excelTarget[i].master_id,
					date_of_birth: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
					gender: excelTarget[i].gender,
					email: excelTarget[i].email,
					mobile_no: excelTarget[i].mobile,
					fax: excelTarget[i].fax,
					address_1: excelTarget[i].address_1,
					address_2: excelTarget[i].address_2,
					address3: excelTarget[i].address3,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					pin_code: fetchZip[0].id,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					IM: excelTarget[i].im,
					company_name: excelTarget[i].company_name,
					social_security_no: excelTarget[i].social_security_no,
					twitter: `http://${excelTarget[i].twitter}`,
					linked_in: `http://${excelTarget[i].linked_in}`,
					facebook: `http://${excelTarget[i].facebook}`,
					google: `http://${excelTarget[i].google}`,
					target_type: "I",
					remarks: excelTarget[i].remarks
				});
			}
		}
	}
	req.flash('success-message', 'Target Imported Successfully');
	res.redirect('/target');
});

router.post('/target/move-to-client', auth, async (req, res) => {
	var target_ids = req.body.target_id;
	var n = req.body.target_id.length;
	for (i = 0; i < n; i++) {
		//target_ids[i]
		var target_data = await Target.findOne({
			where: {
				id: target_ids[i]
			}
		});
		//console.log(target_data);
		await Client.create({
			first_name: target_data.first_name,
			last_name: target_data.last_name,
			email: target_data.email,
			mobile_no: target_data.mobile_no,
			fax: target_data.fax,
			address1: target_data.address_1,
			address2: target_data.address_2,
			address_line_3: target_data.address3,
			country: target_data.country,
			state: target_data.state,
			city: target_data.city,
			pin_code: target_data.postal_code,
			firm_id: target_data.firm_id,
			designation_id: target_data.designation_id,
			type: target_data.type,
			association_type: target_data.association,
			industry_type: target_data.industry_type,
			company_name: target_data.company_name,
			twitter: target_data.twitter,
			linkdn: target_data.linked_in,
			facebook: target_data.facebook,
			google: target_data.google,
			client_id: target_data.target_id,
			master_id: target_data.target_code,
			gender: target_data.gender,
			date_of_birth: target_data.date_of_birth,
			social_security_no: target_data.social_sequrity_no,
			IM: target_data.im,
			organization_name: target_data.organization_name,
			organization_id: target_data.organization_id,
			organization_code: target_data.organization_code,
			user_id: target_data.user_id,
			client_type: target_data.target_type,
			remarks: target_data.remarks
		});

		await Target.update({
			status: '0'
			}, { where: {
				id: target_ids[i]
			}
		});
	}
	res.json({
		code: "200",
        message: 'Success'
	});
});

module.exports = router;