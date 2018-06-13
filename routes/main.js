const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const PracticeArea = require('../models').practicearea;
const Section = require('../models').section;
const Jurisdiction = require('../models').jurisdiction;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/designations', csrfProtection, auth, (req, res) => {
	res.render('designation/index', { layout: 'dashboard', csrfToken: req.csrfToken() });
});

/*==========================Start practice area//Bratin Meheta 12-06-2018=============================*/

router.get('/practice-area', csrfProtection, auth, (req, res) =>{
	var practiceAreaFilter = {};
	if(req.query.practice_area_code){
		practiceAreaFilter.code = req.query.practice_area_code;
	}
	if(req.query.practice_area_name){
		practiceAreaFilter.name = req.query.practice_area_name;
	}
	PracticeArea.findAll({
		where: practiceAreaFilter
	}).then(show =>{
		res.render('practice_area/index',{ 
			layout: 'dashboard', 
			csrfToken: req.csrfToken(), 
			practice_area:show,
			practice_area_code: req.query.practice_area_code ? req.query.practice_area_code : '',
			practice_area_name: req.query.practice_area_name ? req.query.practice_area_name : ''
		});
	});
});

router.post('/practice-area/add', auth, csrfProtection, (req, res) =>{
	PracticeArea.findAndCountAll({
		where:
		{
			code: req.body.code
		}
	}).then(result =>{
		var count = result.count;
		if(count == 0)
		{
			PracticeArea.create({
				code: req.body.code,
				name: req.body.name,
				remarks:req.body.remarks
			}).then(store =>{
				res.json({"a":1});
			});
		}
		else{
			res.json({"a":2});
		}
	});
});
router.post('/admin/edit-practice-area/:id', auth, csrfProtection, (req, res) =>{
	PracticeArea.findAll({
		where: {
			code: req.body.edit_code,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(practice_area => {
		if(practice_area.length === 0) {
			PracticeArea.update({
					code: req.body.edit_code,
					name: req.body.edit_name,
					remarks: req.body.edit_remarks
				},{where: {id: req.params['id']}
			}).then(result =>{
				res.json({"b":1});
			});
		}
		else {
			
			res.json({"b":2});
		}
	});
});

router.post('/admin/delete-practice-area/:id', auth, csrfProtection, (req, res) =>{
	PracticeArea.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"c":1});
	});
});

/*========================================End practice area========================================*/

/*==========================Start Section//Bratin Meheta 13-06-2018=============================*/

router.get('/section', csrfProtection, auth, (req, res) =>{
	var sectionFilter = {};
	if(req.query.section_name) {
		sectionFilter.name = req.query.section_name;
	}
	Section.findAll({
		where: sectionFilter
	}).then(show =>{
		res.render('section/index',{ 
			layout: 'dashboard',
			csrfToken: req.csrfToken(),
			section:show,
			section_name: req.query.section_name ? req.query.section_name : ''
		});
	});
});

router.post('/section/add', auth, csrfProtection, (req, res) =>{
	Section.findAndCountAll({
		where:
		{
			name: req.body.name
		}
	}).then(result =>{
		var count = result.count;
		if(count == 0)
		{
			Section.create({
				name: req.body.name,
				description: req.body.description,
				remarks:req.body.remarks
			}).then(store =>{
				res.json({"add_section":1});
			});
		}
		else{
			res.json({"add_section":2});
		}
	});
});
router.post('/admin/edit-section/:id', auth, csrfProtection, (req, res) =>{
	Section.findAll({
		where: {
			name: req.body.edit_name,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(section => {
		if(section.length === 0) {
			Section.update({
			name: req.body.edit_name,
			description: req.body.edit_description,
			remarks: req.body.edit_remarks
			},{where: {id: req.params['id']}
			}).then(result =>{
				res.json({"edit_section":1});
			});
		}
		else {
			
			res.json({"edit_section":2});
		}
	});
});

router.post('/admin/delete-section/:id', auth, csrfProtection, (req, res) =>{
	Section.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"del_section":1});
	});
});

/*========================================End section========================================*/

/*==========================Start Jurisdiction//Bratin Meheta 13-06-2018=============================*/

router.get('/jurisdiction', csrfProtection, auth, (req, res) =>{
	var whereCondition = {};
	if(req.query.jurisdiction_code) {
		whereCondition.code = req.query.jurisdiction_code;
	}
	if(req.query.jurisdiction_name) {
		whereCondition.name = req.query.jurisdiction_name;
	}
	Jurisdiction.findAll({
		where: whereCondition
	}).then(show =>{
		res.render('jurisdiction/index',{ 
			layout: 'dashboard', 
			csrfToken: req.csrfToken(), 
			jurisdiction:show,
			jurisdiction_code: req.query.jurisdiction_code ? req.query.jurisdiction_code : '',
			jurisdiction_name: req.query.jurisdiction_name ? req.query.jurisdiction_name : ''
		});
	});
});

router.post('/jurisdiction/add', auth, csrfProtection, (req, res) =>{
	Jurisdiction.findAndCountAll({
		where:
		{
			code: req.body.code
		}
	}).then(result =>{
		var count = result.count;
		if(count == 0)
		{
			Jurisdiction.create({
				code: req.body.code,
				name: req.body.name,
				remarks:req.body.remarks
			}).then(store =>{
				res.json({"add_jurisdiction":1});
			});
		}
		else{
			res.json({"add_jurisdiction":2});
		}
	});
});
router.post('/admin/edit-jurisdiction/:id', auth, csrfProtection, (req, res) =>{
	Jurisdiction.findAll({
		where: {
			code: req.body.edit_code,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(jurisdiction => {
		if(jurisdiction.length === 0) {
			Jurisdiction.update({
				code: req.body.edit_code,
				name: req.body.edit_name,
				remarks: req.body.edit_remarks
			},{where: {id: req.params['id']}
			}).then(result =>{
				res.json({"edit_jurisdiction":1});
			});
		}
		else {
			
			res.json({"edit_jurisdiction":2});
		}
	});	
});

router.post('/admin/delete-jurisdiction/:id', auth, csrfProtection, (req, res) =>{
	Jurisdiction.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"del_jurisdiction":1});
	});
});

/*========================================End Jurisdiction========================================*/

module.exports = router;