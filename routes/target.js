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

const Jurisdiction = require('../models').jurisdiction;
const user = require('../models').user;
var csrfProtection = csrf({ cookie: true });
var csv = require('fast-csv');
var path = require('path');
var fs = require('fs');
const router = express.Router();


function removePhoneMask (phone_no){
	var phone_no = phone_no.replace("-","");
	phone_no = phone_no.replace(")","");
	phone_no = phone_no.replace("(","");
	phone_no = phone_no.replace(" ","");
	return phone_no;
}


router.get('/target',auth, firmAttrAuth, csrfProtection, (req,res) => {
	var success_message = req.flash('success-message')[0];
	var success_edit_message = req.flash('success-edit-message')[0];
	var whereCondition = {};
	if(req.query.searchName) {
		whereCondition.target_type = req.query.searchName;
	}
	if(req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	whereCondition.firm_id = req.user.firm_id.toString();
	if(req.user.role_id != 2)
	{
		whereCondition.user_id = req.user.id;
	}
	Target.findAll({
		where: whereCondition
	}).then(targets => {
		res.render('target/targets',{
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

router.get('/target/add',auth, firmAttrAuth, csrfProtection, (req,res) => {
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

router.post('/target/addtarget',auth, firmAttrAuth,csrfProtection, async (req,res) => {
	const formatDate = req.body.target_dob ? req.body.target_dob.split("-") : '';
	const target_data = await Target.findOne({
		where: {
            email: req.body.email
        }
	});
	if(target_data === null)
	{
		if(req.body.target_type === "O")
		{
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
            res.redirect('/target')
		}
		else
		{
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
	}
	else
	{
		req.flash('error-target-message', 'Email already taken.');
        res.redirect('/target/add');
	}
});

router.get('/target/edit/:id',auth, firmAttrAuth, csrfProtection, async(req,res) => {
	var error_message = req.flash('error-clientEdit-message')[0];
	const clients = await Target.findById(req.params['id']);
	const designations = await designation.findAll();
	const industrys = await industry_type.findAll();
	const client_country = await Country.findAll();
	const client_state = await State.findAll({
		where: {country_id : "233"}
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

	res.render('target/targetupdate',{ layout: 'dashboard', csrfToken: req.csrfToken(),designation: designations,industry: industrys,client:clients,country: client_country, state: client_state, city: client_city, zipcode: client_zipcode, error_message });
});

router.post('/target/edittarget/:id',auth, firmAttrAuth,csrfProtection, async (req,res) => {
	const formatDate = req.body.client_dob ? req.body.client_dob.split("-") : '';
	const target_edit_data = await Target.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: req.params['id']
            }
        }
    });
	if(target_edit_data === null)
	{
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
		},{where: {id: req.params['id']}
		});
		req.flash('success-edit-message', 'Client Updated Successfully');
        res.redirect('/target')
	}
	else
	{
		req.flash('error-clientEdit-message', 'Email already taken.');
        res.redirect('/target/edit/'+req.params['id']);
	}
});

router.get('/target/delete/:id',auth, firmAttrAuth, (req,res) => {
  Target.destroy({
    where:{
      id: req.params.id
    }
  }).then(resp => {
		// req.flash('success_delete_attorney','Attorney deleted successfully');
    res.redirect('/target');
  });
});
//==================================================END TARGET================================================================================//




module.exports = router;
