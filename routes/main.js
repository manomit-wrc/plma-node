const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const designation = require('../models').designation;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const PracticeArea = require('../models').practicearea;
const Section = require('../models').section;
const budget = require('../models').budget;

const Jurisdiction = require('../models').jurisdiction;
const user = require('../models').user;
var csrfProtection = csrf({ cookie: true });

const router = express.Router();
//===================================================Designation route starts==========================================================
router.get('/designations', csrfProtection, auth, (req, res) => {
	console.log(req.user);
		var whereCondition = {};
		if(req.query.searchCode) {
			whereCondition.code = req.query.searchCode;
		}
		if(req.query.searchTitle) {
			whereCondition.title = req.query.searchTitle;
		}
    designation.findAll({
			where: whereCondition
		}).then(rows => {
      // console.log(JSON.stringify(rows,undefined,2));
        res.render('designations/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows:  rows, searchTitle: req.query.searchTitle, searchCode: req.query.searchCode  });
    });

});
router.post('/designations/add', auth, csrfProtection, (req, res) => {
    console.log(req.body);
    var code = req.body.code;
    var title = req.body.designation;
    var remarks = req.body.remarks;
    designation.findAndCountAll({
      where:{
        code: code
      }
    }).then(result => {
      if(result.count > 0){
        res.json({msg: 'ERRR'});
      }else{
        designation.create({code: code,title: title,remarks: remarks}).then(resp => {
          res.end("Success");
        });
      }


    });

});
router.get('/designations/find',auth, (req,res) => {
  var id = req.body.id;
  designation.findById(27).then(rows => {
    console.log(rows);
    res.send(rows);
  });
});
router.get('/designations/update/:id',auth, csrfProtection, (req,res) => {
  designation.findById(req.params.id).then(row => {
    console.log(JSON.stringify(row,undefined,10));
    res.render('designations/update',{layout: 'dashboard', csrfToken: req.csrfToken(), designation: row});
  });


});
router.post('/designations/updateDesignation/:id',auth,csrfProtection, (req,res) => {
  var code = req.body.code;
  var title = req.body.designation;
  var remarks = req.body.remarks;
  console.log(req.params.id);
  designation.findAndCountAll({
    where:{
      code: code
    }
  }).then(result => {
    if(result.count > 1){
      res.json({msg: 'ERRR'});
    }else if(result.count == 1 || result.count == 0){
      designation.update({code: code,title: title,remarks: remarks},{where:{id: req.params.id}}).then(resp => {
        res.end("success");
      });
    }
  });

});
router.get('/designations/delete/:id',auth, (req,res) => {
  console.log(req.params.id);
  designation.destroy({
    where:{
      id: req.params.id
    }
  }).then(resp => {
    res.redirect('/designations');
  });
});



//==========================================Designation route ends=============================================
/*==========================================Attorney route starts==============================================*/
router.get('/attorneys',auth,csrfProtection, (req,res) => {
	var whereCondition = {};
	if(req.query.searchName) {
		whereCondition.first_name = req.query.searchName;
	}
	if(req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	whereCondition.role_id = '3';
	user.findAll({
		where: whereCondition
		// where:{
		// 	role_id: '3',
	 

		// }
	}).then(rows => {
		
		res.render('attorney/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows: rows, searchName: req.query.searchName, searchEmail: req.query.searchEmail});
	});
	
});
router.get('/attorney/addAttorney',auth,csrfProtection, (req,res) => {
	res.render('attorney/addattorney',{ layout: 'dashboard', csrfToken: req.csrfToken()});
});
router.post('/attorneys/add',auth,csrfProtection, (req,res) => {
	console.log(new Date());
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = bCrypt.hashSync(req.body.password);
	var dob = req.body.dob;
	var gender = req.body.gender;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var country = req.body.country;
	var mobile_no = req.body.mobile_no;
	var firm_id = req.user.firm_id;
	user.findAndCountAll({
		where:{
			email: email
		}
	}).then(result => {
		if(result.count > 0){
			res.json({msg: 'error'});
		}else{
			user.create({
				first_name: first_name,
				 last_name: last_name,
					email: email, 
					password: password, 
					dob: dob,
					gender: gender,
					address: address,
					city: city,
					state: state,
					country: country,
					mobile_no: mobile_no,
					firm_id: firm_id,
					role_id: '3' 
				}).then(rows => {
					res.send("Success");
				});
		}
		
	});
	
});
router.get('/attorneys/editAttorneys/:id',auth, csrfProtection, (req,res) => {
	 user.findById(req.params.id).then(rows => {
		 res.render('attorney/updateattorney',{ layout: 'dashboard', csrfToken: req.csrfToken(), rows: rows });
	 });
});
router.post('/attorneys/updateAttorney/:id',auth,csrfProtection, (req,res) => {
	console.log(req.params.id);
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = bCrypt.hashSync(req.body.password);
	var dob = req.body.dob;
	var gender = req.body.gender;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var country = req.body.country;
	var mobile_no = req.body.mobile_no;
	var firm_id = req.user.firm_id;
	console.log(req.params.id);
	console.log(email);
	user.findAndCountAll({
		where:{
			email: email
		}
	}).then(result => {
		console.log(result.count);
		if(result.count > 1){
			res.json({msg: 'error'});
		}else if(result.count == 0 || result.count == 1){
			user.update({
								first_name: first_name,
								last_name: last_name,
								email: email,
								password: password,
								dob: dob,
								gender: gender,
								address: address,
								city: city,
								state: state,
								country: country,
								mobile_no: mobile_no,
								firm_id: firm_id
							},{
								where:{
									id: req.params.id}
								}).then(resp => {
									console.log(req.params.id);
								res.send("success");
								console.log(req.params.id);
					    });
		}
	
		// 
	});

	// user.findAndCountAll({
	// 	where:{
	// 		email: email
	// 	}
	// }).then(result => {
	// 	if(result.count > 1){
	// 		console.log(req.params.id);
	// 		res.json({msg: 'error'});
	// 		console.log(req.params.id);
	// 	}else if(result.count == 0 ){
	// 		console.log(req.params.id);
	// 		user.update({
	// 			first_name: first_name,
	// 			last_name: last_name,
	// 			email: email,
	// 			password: password,
	// 			dob: dob,
	// 			gender: gender,
	// 			address: address,
	// 			city: city,
	// 			state: state,
	// 			country: country,
	// 			mobile_no: mobile_no,
	// 			firm_id: firm_id
	// 		},{
	// 			where:{
	// 				id: req.params.id}
	// 			}).then(resp => {
	// 				console.log(req.params.id);
	// 			res.send("success");
	// 			console.log(req.params.id);
  //     });
	// 	}
	// });

});

router.get('/attorneys/delete/:id',auth, (req,res) => {
  console.log(req.params.id);
  user.destroy({
    where:{
      id: req.params.id
    }
  }).then(resp => {
    res.redirect('/attorneys');
  });
});
/*==========================================Attorney route ends==============================================*/
/*======================COMMIT BY MALINI ROYCHOWDHURY 14-06-2018=============================*/

router.get('/budgets', csrfProtection, auth, (req, res) => {
	var whereCondition = {};
	if(req.query.searchCode) {
		whereCondition.code = req.query.searchCode;
	}
	if(req.query.searchName) {
		whereCondition.name = req.query.searchName;
	}
     budget.findAll({
			 where: whereCondition
		 }).then(rows => {
        res.render('budgets/index', { layout: 'dashboard', csrfToken: req.csrfToken(),rows:  rows, searchName: req.query.searchName, searchCode: req.query.searchCode   });
    });

});
//insert
router.post('/budgets/addbudget', auth, csrfProtection, (req, res) => {
    console.log(req.body);
    var code = req.body.code;
    var name = req.body.name;
    var remarks = req.body.remarks;
    budget.findAndCountAll({
      where:{
        code: code
      }
    }).then(result => {
      if(result.count > 0){
        res.json({msg: 'ERRR'});
      }else{
        budget.create({code: code,name: name,remarks: remarks}).then(resp => {
          res.end("Success");
        });
      }


    });
});
 router.get('/budgets/edit/:id',auth,csrfProtection, (req,res) => {


	 budget.findById(req.params.id).then(rows => {

	 res.render('budgets/edit', { layout: 'dashboard', csrfToken: req.csrfToken(),rows:  rows   });
});
});
router.post('/budgets/update/:id',auth,csrfProtection, (req,res) => {
  var code = req.body.code;
  var name = req.body.name;
  var remarks = req.body.remarks;
  console.log(req.params.id);
  budget.findAndCountAll({
    where:{
      code: code
    }
  }).then(result => {
    if(result.count > 0){
      res.json({msg: 'ERRR'});
    }else{
      budget.update({code: code,name: name,remarks: remarks},{where:{id: req.params.id}}).then(resp => {
        res.end("success");
      });
    }
  });

});
router.get('/budgets/delete/:id',auth, (req,res) => {
  console.log(req.params.id);
  budget.destroy({
    where:{
      id: req.params.id
    }
  }).then(resp => {
    res.redirect('/budgets');
  });
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
