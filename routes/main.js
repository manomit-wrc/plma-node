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
const setting = require('../models').setting;

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
		var success_add_designation = req.flash('success_add_designation')[0];
		var success_edit_designation = req.flash('success_edit_designation')[0];
		var success_delete_designation = req.flash('success_delete_designation')[0];
    designation.findAll({
			where: whereCondition
		}).then(rows => {
      // console.log(JSON.stringify(rows,undefined,2));
        res.render('designations/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows:  rows,success_add_designation,success_edit_designation,success_delete_designation, searchTitle: req.query.searchTitle, searchCode: req.query.searchCode  });
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
					req.flash('success_add_designation','Designation added successfully');
        res.json({msg: 'success'});

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
				req.flash('success_edit_designation','Designation edited successfully');
				res.json({msg: 'success'});
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
		req.flash('success_delete_designation','Designation deleted successfully');
    res.redirect('/designations');
  });
});
//==========================================Designation route ends=============================================

/*======================COMMIT BY MALINI ROYCHOWDHURY  (settings) 14-06-2018 -15-06-2018=============================*/

router.get('/settings',auth,csrfProtection, (req,res) => {
	setting.findAll().then(data => {
		console.log(data);
		res.render('superadminsetting/settings', { layout: 'dashboard', csrfToken: req.csrfToken(), data: data, test: 'test' });
 });
});

router.post('/settings/insert',auth,csrfProtection, (req,res) => {

    console.log(req.body);
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

		var hidden_field =  req.body.hidden_field;

   if(hidden_field != ""){
		 setting.update({company_name: companyname,contact_person: contactperson,address: address,country: country,city: city,state: state,postal_code: postalcode,phone_number: phnumber,mobile_number: mbnumber,email: email,fax: fax,weburl: weburl},{where:{id: hidden_field}}).then(resp => {
		 res.end("success");
		});
   }else{
		 setting.create({company_name: companyname,contact_person: contactperson,address: address,country: country,city: city,state: state,postal_code: postalcode,phone_number: phnumber,mobile_number: mbnumber,email: email,fax: fax,weburl: weburl}).then(resp => {
		 res.end("success");
		});
  }
	});
// 	setting.findAndCountAll().then(rows => {
// if(rows.count > 0){
// 	where:{
// 		id: hidden_field
// 	}
//
// 	setting.findAll({
// 		where: whereCondition
// 	  }).then(rows => {
// 		 res.render('/settings/insert', { layout: 'dashboard', csrfToken: req.csrfToken(),rows:  rows});
// 	 });
//    }else{
// 	setting.create({company_name: companyname,contact_person: contactperson,address: address,country: country,city: city,state: state,postal_code: postalcode,phone_number: phnumber,mobile_number: mbnumber,email: email,fax: fax,weburl: weburl}).then(resp => {
// 				res.end("Success");
// 			});
//       }
//       });
//       });

/*======================COMMIT BY MALINI ROYCHOWDHURY// (BUDGET HEAD) //14-06-2018=============================*/
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
	var success_create_attorney = req.flash('success_create_attorney')[0];
	var success_delete_attorney = req.flash('success_delete_attorney')[0];
	var success_edit_attorney = req.flash('success_edit_attorney')[0];
	whereCondition.role_id = '3';
	user.findAll({
		where: whereCondition
		// where:{
		// 	role_id: '3',


		// }
	}).then(rows => {


	res.render('attorney/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows: rows,  success_create_attorney, success_delete_attorney,success_edit_attorney,   searchName: req.query.searchName, searchEmail: req.query.searchEmail});
	});

});
router.get('/attorney/addAttorney',auth,csrfProtection, (req,res) => {
	res.render('attorney/addattorney',{ layout: 'dashboard', csrfToken: req.csrfToken()});
});
router.post('/attorneys/add',auth,csrfProtection, (req,res) => {
	// console.log(new Date());
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var password = bCrypt.hashSync(req.body.password);

	var dob =  req.body.dob ;

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
			console.log(typeof new Date());
			console.log(typeof dob);
			console.log(typeof new Date(req.body.dob));
			console.log(first_name + ',' + last_name + ',' + email + ',' + password + ',' + dob + ',' + gender + ',' + address + ',' + city + ',' +state + ',' + country + ',' + mobile_no + ',' + firm_id + ',' );

			user.create({
				first_name: first_name,
				 last_name: last_name,
					email: email,
					password: password,
					date_of_birth:  req.body.dob,
					gender: gender,
					address: address,
					city: city,
					state: state,
					country: country,
					mobile_no: mobile_no,
					firm_id: firm_id,
					role_id: '3'
				}).then(rows => {
				  req.flash('success_create_attorney','Attorney successfully added');
					res.json({msg: "Success"});
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
								date_of_birth: dob,
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
									req.flash('success_edit_attorney','Attorney edited successfully');
									res.json({msg: 'success'});
								console.log(req.params.id);
					    });
		}


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
	// 			date_of_birth: dob,
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
		req.flash('success_delete_attorney','Attorney deleted successfully');
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
