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
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const industry_type = require('../models').industry_type;
const Contact = require('../models').master_contact;
const Target = require('../models').target;
const Client = require('../models').client;
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
		cb(null, 'public/contact');
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

router.get('/master_contact', auth, firmAttrAuth, csrfProtection, (req, res) => {
	var success_message = req.flash('success-message')[0];
	var success_edit_message = req.flash('success-edit-message')[0];
	var whereCondition = {};
	if (req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	Contact.findAll({
		where: whereCondition
	}).then(result => {
		res.render('master_contact/index', { 
			layout: 'dashboard',  
			csrfToken: req.csrfToken(),
			contacts: result, 
			searchMail: req.query.searchEmail ? req.query.searchEmail : '', 
			success_message, 
			success_edit_message
		});
	});
});

router.get('/master_contact/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-contact-message')[0];
	var industry_types = await industry_type.findAll();
	var country = await Country.findAll();
	const state = await State.findAll({
		where: { country_id : "233" }
	});
	res.render('master_contact/add', { layout: 'dashboard', csrfToken: req.csrfToken(), industry_types: industry_types, country: country, state: state, error_message });
});

router.post('/master_contact/add', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const formatDate = req.body.dob ? req.body.dob.split("-") : '';
	const contact_data = await Contact.findOne({
		where: {
			email: req.body.email
		}
	});
	if (contact_data === null) {
		await Contact.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			phone_no: removePhoneMask(req.body.phone_no),
			fax: removePhoneMask(req.body.fax),
			mobile_no: removePhoneMask(req.body.mobile_no),
			master_contact_id: req.body.master_contact_id,
			master_contact_code: req.body.master_contact_code,
			master_designation: req.body.master_contact_desg,
			company_name: req.body.master_contact_comp,
			date_of_birth: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
			gender: req.body.gender,
			address1: req.body.address1,
			address2: req.body.address2,
			address3: req.body.address3,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			zip_code: req.body.zipcode,
			address_remarks: req.body.address_remarks,
			website_url: req.body.website_url,
			social_url: req.body.social_url,
			im: req.body.im,
			social_security_no: removePhoneMask(req.body.social_sec_no),
			twitter: req.body.twitter,
			linkedin: req.body.linkedin,
			google: req.body.google,
			youtube: req.body.youtube,
			status: req.body.status,
			industry_type: req.body.industry_type,
			firm_id: req.user.firm_id,
			user_id: req.user.id,
			remarks: req.body.remarks
		});
		req.flash('success-message', 'Master Contact Added Successfully');
		res.redirect('/master_contact');
	} else {
		req.flash('error-contact-message', 'Email already taken.');
		res.redirect('/master_contact/add');
	}
});

router.get('/master_contact/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-contact-message')[0];
	const contact = await Contact.findById(req.params['id']);
	const industry_types = await industry_type.findAll();
	const country = await Country.findAll();
	const state = await State.findAll({
		where: { country_id : "233" }
	});
	const city = await City.findAll({
		where: {
			state_id : contact.state.toString()
		}
	});
	const cities = await City.findById(contact.city.toString());
	const zipcode = await Zipcode.findAll({
		where: {
			city_name: cities.name
		}
	});
	res.render('master_contact/edit', { layout: 'dashboard', csrfToken: req.csrfToken(), industry_types: industry_types, contact:contact, country: country, state: state, city: city, zipcode: zipcode, error_message });
});

router.post('/master_contact/edit/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	const formatDate = req.body.dob ? req.body.dob.split("-") : '';
	const contact_edit_data = await Contact.findOne({
		where: {
			email: req.body.email,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	});
	if (contact_edit_data === null) {
		await Contact.update({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			phone_no: removePhoneMask(req.body.phone_no),
			fax: removePhoneMask(req.body.fax),
			mobile_no: removePhoneMask(req.body.mobile_no),
			master_contact_id: req.body.master_contact_id,
			master_contact_code: req.body.master_contact_code,
			master_designation: req.body.master_contact_desg,
			company_name: req.body.master_contact_comp,
			date_of_birth: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
			gender: req.body.gender,
			address1: req.body.address1,
			address2: req.body.address2,
			address3: req.body.address3,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			zip_code: req.body.zipcode,
			address_remarks: req.body.address_remarks,
			website_url: req.body.website_url,
			social_url: req.body.social_url,
			im: req.body.im,
			social_security_no: removePhoneMask(req.body.social_sec_no),
			twitter: req.body.twitter,
			linkedin: req.body.linkedin,
			google: req.body.google,
			youtube: req.body.youtube,
			status: req.body.status,
			industry_type: req.body.industry_type,
			firm_id: req.user.firm_id,
			user_id: req.user.id,
			remarks: req.body.remarks
			}, {where: {id: req.params['id']}
		});
		req.flash('success-message', 'Master Contact Updated Successfully');
		res.redirect('/master_contact')
	} else {
		req.flash('error-contact-message', 'Email already taken.');
		res.redirect('/master_contact/edit/'+req.params['id']);
	}
});

router.get('/master_contact/delete/:id', auth, firmAttrAuth, (req, res) => {
	Contact.destroy({
		where: {
			id: req.params.id
		}
	}).then(resp => {
		req.flash('success-message', 'Master Contact Deleted Successfully');
		res.redirect('/master_contact');
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

/*router.post('/master_contact/import', auth, upload.single('file_name'), csrfProtection, async (req, res) => {
	var target_xl = xlsx.parse(fs.readFileSync('public/master_contact/' + fileName));
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
		}
	}
	req.flash('success-message', 'Master Contact Imported Successfully');
	res.redirect('/master_contact');
});

router.post('/master_contact/move-to-target', auth, async (req, res) => {
	var contact_ids = req.body.contact_id;
	var n = req.body.contact_id.length;
	for (i = 0; i < n; i++) {
		var contact_data = await Contact.findOne({
			where: {
				id: contact_ids[i]
			}
		});
		//console.log(contact_data);
		await Target.create({
			first_name: contact_data.first_name,
			last_name: contact_data.last_name,
			email: contact_data.email,
			mobile_no: contact_data.mobile_no,
			fax: contact_data.fax,
			address1: contact_data.address_1,
			address2: contact_data.address_2,
			address_line_3: contact_data.address3,
			country: contact_data.country,
			state: contact_data.state,
			city: contact_data.city,
			pin_code: contact_data.postal_code,
			firm_id: contact_data.firm_id,
			designation_id: contact_data.designation_id,
			type: contact_data.type,
			association_type: contact_data.association,
			industry_type: contact_data.industry_type,
			company_name: contact_data.company_name,
			twitter: contact_data.twitter,
			linkdn: contact_data.linked_in,
			facebook: contact_data.facebook,
			google: contact_data.google,
			client_id: contact_data.target_id,
			master_id: contact_data.target_code,
			gender: contact_data.gender,
			date_of_birth: contact_data.date_of_birth,
			social_security_no: contact_data.social_sequrity_no,
			IM: contact_data.im,
			organization_name: contact_data.organization_name,
			organization_id: contact_data.organization_id,
			organization_code: contact_data.organization_code,
			user_id: contact_data.user_id,
			client_type: contact_data.target_type,
			remarks: contact_data.remarks
		});

		await Contact.update({
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
});*/

module.exports = router;