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
var csrfProtection = csrf({ cookie: true });

const router = express.Router();

function removePhoneMask(phone_no) {
	var phone_no = phone_no.replace("-","");
	phone_no = phone_no.replace(")","");
	phone_no = phone_no.replace("(","");
	phone_no = phone_no.replace(" ","");
	return phone_no;
}

router.get('/referral', auth, firmAttrAuth, csrfProtection, async(req, res)=> {
	var success_message = req.flash('success-ref-message')[0];
	var successEdit_message = req.flash('success-refEdit-message')[0];
	var successDel_message = req.flash('success_delete_referral')[0];
	var whereCondition = {};
	if (req.query.searchName) {
		whereCondition.referral_type = req.query.searchName;
	}
	if (req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	const referral = await Referral.findAll({
		where: whereCondition
	});
	res.render('referral/index', { 
		layout: 'dashboard', 
		success_message, 
		referral, 
		successEdit_message, 
		successDel_message,
		searchName: req.query.searchName ? req.query.searchName : '', 
		searchMail: req.query.searchEmail ? req.query.searchEmail : ''
	});
});

router.get('/referral/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	var err_message = req.flash('error-referral-message')[0];
	const attorney = await User.findAll({
		where: {
			role_id : 3
		}
	});
	const client = await Client.findAll();
	const target = await Target.findAll();
	res.render('referral/add', { 
		layout: 'dashboard',
		csrfToken: req.csrfToken(),
		attorney,
		client,
		target,
		err_message,
	});
});

router.post('/referral/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	const ref_email = await Referral.findOne({
		where: {
			email: req.body.email
		}
	});
	if(ref_email === null) 
	{
		if(req.body.referral_type == "I")
		{
			const store_ref_I = await Referral.create({
				referral_type: req.body.referral_type,
				attorney_id: parseInt(req.body.attr_id),
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				mobile: removePhoneMask(req.body.mobile_no),
				referred_type: req.body.ref_type,
				target_id:req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				client_id:req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0,
				remarks: req.body.remarks
			});
		}
		else
		{
			const store_ref_O = await Referral.create({
				referral_type: req.body.referral_type,
				attorney_id: parseInt(req.body.attr_id),
				organization_name: req.body.org_name,
				email: req.body.email,
				mobile: removePhoneMask(req.body.mobile_no),
				referred_type: req.body.ref_type,
				target_id:req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				client_id:req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0,
				remarks: req.body.remarks
			});
		}
		req.flash('success-ref-message', 'Referral Created Successfully');
		res.redirect("/referral");
	}
	else
	{
		req.flash('error-referral-message', 'Email already taken.');
		res.redirect('/referral/add');
	}
});

router.get('/referral/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	var err_message = req.flash('error-referral-message')[0];
	const referral = await Referral.findById(req.params['id']);
	const attorney = await User.findAll({
		where: {
			role_id : 3
		}
	});
	const client = await Client.findAll();
	const target = await Target.findAll();
	res.render('referral/edit', {layout: 'dashboard', csrfToken: req.csrfToken(), referral, attorney, client, target, err_message});
});

router.post('/referral/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
	const edit_data = await Referral.findOne({
		where: {
			email: req.body.email,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	});
	if (edit_data === null) 
	{
		const store_ref_I = await Referral.update({
			referral_type: req.body.referral_type,
			attorney_id: parseInt(req.body.attr_id),
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			organization_name: req.body.org_name,
			email: req.body.email,
			mobile: removePhoneMask(req.body.mobile_no),
			referred_type: req.body.ref_type,
	    		//target_id:req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
	    		//client_id:req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0,
	    		remarks: req.body.remarks
	    	},{ where: { id: req.params['id']}
	    });
		if(req.body.ref_type == "T")
		{
			const referred_edit = await Referral.update({
				target_id:req.body.referred_id_t ? parseInt(req.body.referred_id_t) : 0,
				client_id: 0
			},{where: {id: req.params['id']}
		});
		}
		else
		{
			const referred_edit = await Referral.update({
				target_id:0,
				client_id: req.body.referred_id_c ? parseInt(req.body.referred_id_c) : 0
			},{where: {id: req.params['id']}
		});
		}
		req.flash('success-refEdit-message', 'Referral Updated Successfully');
		res.redirect("/referral");
	}
	else
	{
		req.flash('error-referral-message', 'Email already taken.');
		res.redirect('/referral/edit/'+req.params['id']);
	}
});

router.get('/referral/delete/:id', auth, firmAttrAuth, (req, res) => {
	Referral.destroy({
		where: {
			id: req.params.id
		}
	}).then(resp => {
		req.flash('success_delete_referral','Referral deleted successfully');
		res.redirect('/referral');
	});
});


module.exports = router;