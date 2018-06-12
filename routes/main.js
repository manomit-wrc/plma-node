const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const PracticeArea = require('../models').practicearea;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/designations', csrfProtection, auth, (req, res) => {
	res.render('designation/index', { layout: 'dashboard', csrfToken: req.csrfToken() });
});

/*==========================Start practice area//Bratin Meheta 12-06-2018=============================*/
router.get('/practice-area', csrfProtection, auth, (req, res) =>{
	PracticeArea.findAll().then(show =>{
	res.render('practice_area/index',{ layout: 'dashboard', csrfToken: req.csrfToken(), practice_area:show });
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
	PracticeArea.update({
		code: req.body.edit_code,
		name: req.body.edit_name,
		remarks: req.body.edit_remarks
	},{where: {id: req.params['id']}
	}).then(result =>{
		res.json({"b":1});
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

module.exports = router;