const express = require('express');
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const firmAuth = require('../middlewares/firm_auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
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
	var phone_no = phone_no.replace("-", "");
	phone_no = phone_no.replace(")", "");
	phone_no = phone_no.replace("(", "");
	phone_no = phone_no.replace(" ", "");
	return phone_no;
}

router.get('/master_contact', auth, firmAttrAuth, csrfProtection, (req, res) => {
	var success_message = req.flash('success-message')[0];
	var success_edit_message = req.flash('success-edit-message')[0];
	var whereCondition = {};
	if (req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	whereCondition.contact_status = 1;
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
		where: { country_id: "233" }
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
			date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
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
		where: { country_id: "233" }
	});
	const city = await City.findAll({
		where: {
			state_id: contact.state.toString()
		}
	});
	const cities = await City.findById(contact.city.toString());
	const zipcode = await Zipcode.findAll({
		where: {
			city_name: cities.name
		}
	});
	res.render('master_contact/edit', { layout: 'dashboard', csrfToken: req.csrfToken(), industry_types: industry_types, contact: contact, country: country, state: state, city: city, zipcode: zipcode, error_message });
});


router.get('/master_contact/view/:id', auth, firmAttrAuth, csrfProtection, async (req, res) => {
	var error_message = req.flash('error-contact-message')[0];
	const contact = await Contact.findById(req.params['id']);
	const industry_types = await industry_type.findAll();
	const country = await Country.findAll();
	const state = await State.findAll({
		where: { country_id: "233" }
	});
	const city = await City.findAll({
		where: {
			state_id: contact.state.toString()
		}
	});
	const cities = await City.findById(contact.city.toString());
	const zipcode = await Zipcode.findAll({
		where: {
			city_name: cities.name
		}
	});
	res.render('master_contact/view', { layout: 'dashboard', csrfToken: req.csrfToken(), industry_types: industry_types, contact: contact, country: country, state: state, city: city, zipcode: zipcode, error_message });
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
			date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
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
		}, {
				where: { id: req.params['id'] }
			});
		req.flash('success-message', 'Master Contact Updated Successfully');
		res.redirect('/master_contact')
	} else {
		req.flash('error-contact-message', 'Email already taken.');
		res.redirect('/master_contact/edit/' + req.params['id']);
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

router.post('/master_contact/multiple-delete/', auth, firmAttrAuth, async (req, res) => {
	var contact_ids = req.body.contact_id;
	var n = req.body.contact_id.length;
	for (i = 0; i < n; i++) {

		Contact.destroy({
			where: {
				id: contact_ids[i]
			}
		})
	}
	res.json({
		code: "200",
		message: 'Success'
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

String.prototype.capitaLize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

router.post('/master_contact/import', auth, upload.single('file_name'), csrfProtection, async (req, res) => {
	var contact_xl = xlsx.parse(fs.readFileSync('public/contact/' + fileName));
	var importedData = JSON.stringify(convertToJSON(contact_xl[0].data));
	var excelContact = JSON.parse(importedData);
	for (var i = 0; i < excelContact.length; i++) {
		try {
			const formatDate = excelContact[i].dob ? excelContact[i].dob.split("-") : '';
			var excel_state = excelContact[i].state.capitaLize();
			var excel_city = excelContact[i].city.capitaLize();
			var excel_zip = excelContact[i].zipcode;
			var fetchState = [];
			var fetchCity = [];
			var fetchZip = [];
			if (excelContact[i].state !== null) {
				var fetchState = await State.findAll({
					where: { name: excel_state }
				});
			}
			if (excelContact[i].city !== null) {
				var fetchCity = await City.findAll({
					where: { name: excel_city }
				});
			}
			if (excelContact[i].zipcode !== null) {
				var fetchZip = await Zipcode.findAll({
					where: { zip: excel_zip }
				});
			}
			const contact_excel_data = await Contact.findOne({
				where: {
					email: excelContact[i].email
				}
			});
			if (contact_excel_data === null) {
				await Contact.create({
					first_name: excelContact[i].first_name,
					last_name: excelContact[i].last_name,
					email: excelContact[i].email,
					phone_no: excelContact[i].phone,
					fax: excelContact[i].fax,
					mobile_no: excelContact[i].mobile,
					master_contact_id: excelContact[i].master_contact_id,
					master_contact_code: excelContact[i].master_contact_code,
					master_designation: excelContact[i].master_designation,
					company_name: excelContact[i].company_name,
					date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0] : null,
					gender: excelContact[i].gender,
					address1: excelContact[i].address1,
					address2: excelContact[i].address2,
					address3: excelContact[i].address3,
					country: 233,
					state: fetchState[0].id,
					city: fetchCity[0].id,
					zip_code: fetchZip[0].id,
					im: excelContact[i].im,
					social_security_no: excelContact[i].social_security_no,
					twitter: `http://${excelContact[i].twitter}`,
					linkedin: `http://${excelContact[i].linkedin}`,
					google: `http://${excelContact[i].google}`,
					youtube: `http://${excelContact[i].youtube}`,
					firm_id: req.user.firm_id,
					user_id: req.user.id,
					remarks: excelContact[i].remarks
				});
			}
		}
		catch (error) {
			req.flash('success-message', 'Master Contact Imported Successfully');
			res.redirect('/master_contact');
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
		await Target.create({
			first_name: contact_data.first_name,
			last_name: contact_data.last_name,
			email: contact_data.email,
			mobile_no: contact_data.mobile_no,
			fax: contact_data.fax,
			date_of_birth: contact_data.date_of_birth,
			gender: contact_data.gender,
			address_1: contact_data.address1,
			address_2: contact_data.address2,
			address3: contact_data.address3,
			country: contact_data.country,
			state: contact_data.state,
			city: contact_data.city,
			postal_code: contact_data.zip_code,
			company_name: contact_data.company_name,
			im: contact_data.im,
			social_security_no: contact_data.social_security_no,
			twitter: contact_data.twitter,
			linked_in: contact_data.linkedin,
			google: contact_data.google,
			youtube: contact_data.youtube,
			target_type: 'I',
			firm_id: contact_data.firm_id,
			user_id: contact_data.user_id,
			remarks: contact_data.remarks
		});

		await Contact.update({
			contact_status: 0
		}, {
				where: {
					id: contact_ids[i]
				}
			});
	}
	res.json({
		code: "200",
		message: 'Success'
	});
});

module.exports = router;
