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
const zipcode = require('../models').zipcode;
const city = require('../models').city;
const state = require('../models').state;
const country = require('../models').country;
const industry_type = require('../models').industry_type;
const Jurisdiction = require('../models').jurisdiction;
const client = require('../models').client;
const user = require('../models').user;
var csrfProtection = csrf({ cookie: true });
var csv = require('fast-csv');
var path      = require('path');
var fs = require('fs');
const router = express.Router();
//===================================================Designation route starts==========================================================
router.get('/designations', csrfProtection, auth, siteAuth, (req, res) => {
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
router.post('/designations/add', auth, siteAuth, csrfProtection, (req, res) => {
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
router.get('/designations/find',auth, siteAuth, (req,res) => {
  var id = req.body.id;
  designation.findById(27).then(rows => {
    console.log(rows);
    res.send(rows);
  });
});
router.get('/designations/update/:id',auth, siteAuth, csrfProtection, (req,res) => {
  designation.findById(req.params.id).then(row => {
    console.log(JSON.stringify(row,undefined,10));
    res.render('designations/update',{layout: 'dashboard', csrfToken: req.csrfToken(), designation: row});
  });


});
router.post('/designations/updateDesignation/:id',auth, siteAuth,csrfProtection, (req,res) => {
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
router.get('/designations/delete/:id',auth, siteAuth, (req,res) => {
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
/*==========================================Attorney route starts==============================================*/
router.get('/attorneys',auth, firmAuth,csrfProtection, (req,res) => {
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
	 
	}).then(rows => {


	res.render('attorney/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows: rows,  success_create_attorney, success_delete_attorney,success_edit_attorney,   searchName: req.query.searchName, searchEmail: req.query.searchEmail});
	});

});
router.get('/attorney/addAttorney',auth, firmAuth,csrfProtection, (req,res) => {
	res.render('attorney/addattorney',{ layout: 'dashboard', csrfToken: req.csrfToken()});
});
router.post('/attorneys/add',auth, firmAuth,csrfProtection, (req,res) => {
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
router.get('/attorneys/editAttorneys/:id',auth, firmAuth, csrfProtection, (req,res) => {
	 user.findById(req.params.id).then(rows => {
		 res.render('attorney/updateattorney',{ layout: 'dashboard', csrfToken: req.csrfToken(), rows: rows });
	 });
});
router.post('/attorneys/updateAttorney/:id',auth, firmAuth,csrfProtection, (req,res) => {
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
		}else {
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

router.get('/attorneys/delete/:id',auth, firmAuth, (req,res) => {
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

/*==========================================Client route starts==============================================*/
router.get('/client',auth, firmAttrAuth, csrfProtection, (req,res) => {
	var whereCondition = {};
	if(req.query.searchName) {
		whereCondition.first_name = req.query.searchName;
	}
	if(req.query.searchEmail) {
		whereCondition.email = req.query.searchEmail;
	}
	 
			 client.findAll({
				 where: whereCondition
			 }).then(clients => {
				res.render('client/index',{ layout: 'dashboard',  csrfToken: req.csrfToken() ,clients: clients });
			 });
		
		 
	
});
router.get('/client/add',auth, firmAttrAuth, csrfProtection, (req,res) => {
	designation.findAll().then(designation => {
		industry_type.findAll().then(industry => {
	country.findAll().then(country => {

		state.findAll().then(state => {
		//  console.log(JSON.stringify(state, undefined, 2));
			res.render('client/addclient',{ layout: 'dashboard', csrfToken: req.csrfToken(), country: country, state: state, designations: designation, industry: industry  });
		});
	});
});
});

});
router.get('/client/edit/:id',auth, firmAttrAuth, csrfProtection, (req,res) => {
var clientId = req.params.id;

	designation.findAll().then(designation => {
		industry_type.findAll().then(industry => {
			country.findAll().then(country => {

		state.findAll().then(state => {
		//  console.log(JSON.stringify(state, undefined, 2));
		client.findById(clientId).then(client => {
			res.render('client/editClient',{ layout: 'dashboard', csrfToken: req.csrfToken(), country: country, state: state, designations: designation, industry: industry,client: client  });
		});
		
		});
	});
});
});

});
router.post('/client/addClient',auth, firmAttrAuth,csrfProtection, (req,res) => {
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var mobile_no = req.body.mobile_no;
	var address1 = req.body.address1;
	var address2 = req.body.address2;
	var country = req.body.country;
	var state = req.body.state;
	var city = req.body.city;
	var pin_code = req.body.pin_code;
	var designation = req.body.designation;
	var type = req.body.type;
	var company_name = req.body.company_name;
	var twitter = req.body.twitter;
	var linkdn = req.body.linkdn;
	var facebook = req.body.facebook;
	var google = req.body.google;
	var association = req.body.association;
	var industry_type = req.body.industry_type;
	var fax = req.body.fax;
	console.log("HELLO");
	console.log(first_name);
	console.log(first_name+last_name+email+mobile_no+address1+address2+country+state+city+pin_code+designation+type+company_name+twitter+linkdn);
	client.findAndCountAll({
		where:{
			email: email
		}
	}).then(result => {
		if(result.count > 0){
			res.json({msg: 'error'});
		}else{
			client.create({
				first_name: first_name,
				last_name: last_name,
				email: email,
				mobile_no: mobile_no,
				address1: address1,
				address2: address2,
				country: country,
				state: state,
				city: city,
				pin_code: pin_code,
				designation_id: designation,
				type: type,
				company_name: company_name,
				twitter: twitter,
				linkdn: linkdn,
				facebook: facebook,
				google: google,
				association_type: association,
				industry_type: industry_type,
				firm_id: req.user.firm_id,
				fax: fax
			}).then(resp =>  {
				res.json({msg: 'Success'});
			});
		}
	});



});
router.post('/client/editClient',auth, firmAttrAuth,csrfProtection, (req,res) => {
	var id = req.body.id;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var email = req.body.email;
	var mobile_no = req.body.mobile_no;
	var address1 = req.body.address1;
	var address2 = req.body.address2;
	var country = req.body.country;
	var state = req.body.state;
	var city = req.body.city;
	var pin_code = req.body.pin_code;
	var designation = req.body.designation;
	var type = req.body.type;
	var company_name = req.body.company_name;
	var twitter = req.body.twitter;
	var linkdn = req.body.linkdn;
	var facebook = req.body.facebook;
	var google = req.body.google;
	var association = req.body.association;
	var industry_type = req.body.industry_type;
	var fax = req.body.fax;
	console.log("HELLO");
	console.log(first_name);
	console.log(first_name+last_name+email+mobile_no+address1+address2+country+state+city+pin_code+designation+type+company_name+twitter+linkdn);
	client.findAndCountAll({
		where:{
			email: email
		}
	}).then(result => {
		if(result.count > 1){
			res.json({msg: 'error'});
		}else{
			client.update({
				first_name: first_name,
				last_name: last_name,
				email: email,
				mobile_no: mobile_no,
				address1: address1,
				address2: address2,
				country: country,
				state: state,
				city: city,
				pin_code: pin_code,
				designation_id: designation,
				type: type,
				company_name: company_name,
				twitter: twitter,
				linkdn: linkdn,
				facebook: facebook,
				google: google,
				association_type: association,
				industry_type: industry_type,
				firm_id: req.user.firm_id,
				fax: fax
			},{
				where: {
					id: id
				}
			}).then(resp =>  {
				res.json({msg: 'Success'});
			});
		}
	});



});

router.get('/client/delete/:id',auth, firmAttrAuth, (req,res) => {
  console.log(req.params.id);
  client.destroy({
    where:{
      id: req.params.id
    }
  }).then(resp => {
		// req.flash('success_delete_attorney','Attorney deleted successfully');
    res.redirect('/client');
  });
});
router.post('/client/findCityByState',auth, firmAttrAuth, csrfProtection, (req,res) => {

	city.findAll({
		where:{
			state_id: req.body.state_id
		}
	}
	).then(city => {
		// res.send(city);
		res.json({city: city});
	});
});
router.post('/client/findPinByCity',auth, firmAttrAuth, csrfProtection, (req,res) => {
	city.findById(req.body.city_id).then(row => {
		console.log(row.name);
		zipcode.findAll({
			where:{
				city_name: row.name
			}
		}
		).then(pin => {
			console.log(JSON.stringify(pin, undefined, 2));
			// res.send(city);
			res.json({pin: pin});
		});

	});
	

	});


/*==========================================Client route ends==============================================*/

/*==========================================Import csv routes starts=========================================*/

router.get('/import/csv',auth,csrfProtection, (req,res) => {
	// var csv = fs.createReadStream("./"+"public/cities.csv");
	csv
	.fromPath("./public/states (1).csv")
	.on("data", function(data){
			console.log(data[2]);
			state.create({id:data[0],code: data[1],name: data[2],country_id: data[3]}).then(result =>{
				console.log("END");
			});
	})
	.on("end", function(){
			// console.log("done");

			res.redirect('/');
	});



});
/*==========================================Import csv routes ends=========================================*/

/*================================COMMIT BY MALINI ROYCHOWDHURY 14-06-2018=================================*/

router.get('/budgets', csrfProtection, siteAuth, auth, (req, res) => {
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
router.post('/budgets/addbudget', auth, siteAuth, csrfProtection, (req, res) => {
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
 router.get('/budgets/edit/:id',auth, siteAuth,csrfProtection, (req,res) => {


	 budget.findById(req.params.id).then(rows => {

	 res.render('budgets/edit', { layout: 'dashboard', csrfToken: req.csrfToken(),rows:  rows   });
});
});
router.post('/budgets/update/:id',auth, siteAuth,csrfProtection, (req,res) => {
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
router.get('/budgets/delete/:id',auth, siteAuth, (req,res) => {
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

router.get('/practice-area', csrfProtection, auth, siteAuth, (req, res) =>{
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

router.post('/practice-area/add', auth, siteAuth, csrfProtection, (req, res) =>{
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
router.post('/admin/edit-practice-area/:id', auth, siteAuth, csrfProtection, (req, res) =>{
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

router.post('/admin/delete-practice-area/:id', auth, siteAuth, csrfProtection, (req, res) =>{
	PracticeArea.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"c":1});
	});
});

/*========================================End practice area========================================*/

/*==========================Start Section//Bratin Meheta 13-06-2018=============================*/

router.get('/section', csrfProtection, auth, siteAuth, (req, res) =>{
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

router.post('/section/add', auth, siteAuth, csrfProtection, (req, res) =>{
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
router.post('/admin/edit-section/:id', auth, siteAuth, csrfProtection, (req, res) =>{
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

router.post('/admin/delete-section/:id', auth, siteAuth, csrfProtection, (req, res) =>{
	Section.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"del_section":1});
	});
});

/*========================================End section========================================*/

/*==========================Start Jurisdiction//Bratin Meheta 13-06-2018=============================*/

router.get('/jurisdiction', csrfProtection, auth, siteAuth, (req, res) =>{
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

router.post('/jurisdiction/add', auth, siteAuth, csrfProtection, (req, res) =>{
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
router.post('/admin/edit-jurisdiction/:id', auth, siteAuth, csrfProtection, (req, res) =>{
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

router.post('/admin/delete-jurisdiction/:id', auth, siteAuth, csrfProtection, (req, res) =>{
	Jurisdiction.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"del_jurisdiction":1});
	});
});

/*========================================End Jurisdiction========================================*/

/*==========================Start Group//Bratin Meheta 13-06-2018=============================*/

router.get('/group', csrfProtection, auth, siteAuth, (req, res) =>{
	var whereCondition = {};
	if(req.query.group_code) {
		whereCondition.code = req.query.group_code;
	}
	if(req.query.group_name) {
		whereCondition.name = req.query.group_name;
	}
	Group.findAll({
		where: whereCondition
	}).then(show =>{
		res.render('group/index',{
			layout: 'dashboard',
			csrfToken: req.csrfToken(),
			group:show,
			group_code: req.query.group_code ? req.query.group_code : '',
			group_name: req.query.group_name ? req.query.group_name : ''
		});
	});
});

router.post('/group/add', auth, siteAuth, csrfProtection, (req, res) =>{
	Group.findAndCountAll({
		where:
		{
			code: req.body.code
		}
	}).then(result =>{
		var count = result.count;
		if(count == 0)
		{
			Group.create({
				code: req.body.code,
				name: req.body.name,
				remarks:req.body.remarks
			}).then(store =>{
				res.json({"add_group":1});
			});
		}
		else{
			res.json({"add_group":2});
		}
	});
});
router.post('/admin/edit-group/:id', auth, siteAuth, csrfProtection, (req, res) =>{
	Group.findAll({
		where: {
			code: req.body.edit_code,
			id: {
				[Op.ne]: req.params['id']
			}
		}
	}).then(group => {
		if(group.length === 0) {
			Group.update({
				code: req.body.edit_code,
				name: req.body.edit_name,
				remarks: req.body.edit_remarks
			},{where: {id: req.params['id']}
			}).then(result =>{
				res.json({"edit_group":1});
			});
		}
		else {

			res.json({"edit_group":2});
		}
	});
});

router.post('/admin/delete-group/:id', auth, siteAuth, csrfProtection, (req, res) =>{
	Group.destroy({
		where: {id: req.params['id']}
	}).then(result =>{
		res.json({"del_group":1});
	});
});

/*========================================End group========================================*/

module.exports = router;
