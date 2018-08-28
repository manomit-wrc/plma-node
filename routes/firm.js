const express = require('express');
const auth = require('../middlewares/auth');
const firmAuth = require('../middlewares/firm_auth');
const siteAuth = require('../middlewares/site_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const Office = require('../models').office;
const Designation = require('../models').designation;
const Group = require('../models').group;
const Contact = require('../models').office_contact;
const Country = require('../models').country;
const State = require('../models').state;
const City = require('../models').city;
const Zipcode = require('../models').zipcode;
const Section = require('../models').section;
const PracticeArea = require('../models').practicearea;
const Jurisdiction = require('../models').jurisdiction;
const SectionToFirm = require('../models').section_to_firms;
const JurisdictionToFirm = require('../models').jurisdiction_to_firms;
const PracticeAreaToFirm = require('../models').practice_area_to_firms;


const sendmail = require('node-mailjet').connect('b9b8c1979e9b71715ab00ca4ea621e4e', '48ba3e55307333a99fcba3fc60e0a66e');



var csrfProtection = csrf({ cookie: true });

const router = express.Router();
function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    return phone_no;
}

router.get('/firms', csrfProtection, auth, siteAuth, async (req, res) => {
    var success_message = req.flash('success-firm-message')[0];
    var whereStatement = {};
    if (req.query.search_email) {
        whereStatement.email = req.query.search_email;
    }
    if (req.query.search_firm) {
        whereStatement.firm_id = req.query.search_firm;
    }
    whereStatement.role_id = 2;
    User.belongsTo(Firm, {foreignKey: 'firm_id'});
    const users = await User.findAll({
        where: whereStatement,
        include: [{
            model: Firm
        }]
    });

    const firms = await Firm.findAll({});
    const designation = await Designation.findAll();
    const group = await Group.findAll();

    res.render('firms/index', {
        layout: 'dashboard',
        success_message,
        csrfToken: req.csrfToken(),
        users,
        designation,
        firms,
        group,
        search_email: req.query ? req.query.search_email : '',
        search_firm: req.query ? req.query.search_firm : ''
    });
});

router.get('/get-level-2-designation', auth, async (req, res) => {
    const designation = await Designation.findAll();
    res.send({
        designations: designation
    });
});

router.post('/firms/add', auth, siteAuth, csrfProtection, async (req, res) => {
    const user_data = await User.findOne({
        where: {
            email: req.body.email
        }
    });




    
	 if(user_data == null){
		// console.log(req.body.pass)
	   var email_body =`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	   <html xmlns="http://www.w3.org/1999/xhtml">
	   
	   <head>
		 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		 <meta name="viewport" content="width=device-width">
		 <meta name="format-detection" content="telephone=no">
		 <!--[if !mso]>
		   <!-->
			 <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800,300&subset=latin" rel="stylesheet" type="text/css">
			 <!--<![endif]-->
			 <title>Performlaw Password Reset</title>
			 <style type="text/css">
			 *{
			  margin:0;
			  padding:0;
			  font-family:'OpenSans-Light', "Helvetica Neue", "Helvetica",Calibri, Arial, sans-serif;
			  font-size:100%;
			  line-height:1.6;
			}
			img{
			  max-width:100%;
			}
			body{
			  -webkit-font-smoothing:antialiased;
			  -webkit-text-size-adjust:none;
			  width:100%!important;
			  height:100%;
			}
			a{
			  color:#348eda;
			}
			.btn-primary{
			  text-decoration:none;
			  color:#FFF;
			  background-color:#a55bff;
			  border:solid #a55bff;
			  border-width:10px 20px;
			  line-height:2;
			  font-weight:bold;
			  margin-right:10px;
			  text-align:center;
			  cursor:pointer;
			  display:inline-block;
			}
			.last{
			  margin-bottom:0;
			}
			.first{
			  margin-top:0;
			}
			.padding{
			  padding:10px 0;
			}
			table.body-wrap{
			  width:100%;
			  padding:0px;
			  /*padding-top:20px;*/
			  margin:0px;
			}
			table.body-wrap .container{
			  border:1px solid #f0f0f0;
			}
			table.footer-wrap{
			  width:100%;
			  clear:both!important;
			}
			.footer-wrap .container p{
			  font-size:12px;
			  color:#666;
			}
			table.footer-wrap a{
			  color:#999;
			}
			.footer-content{
			  margin:0px;
			  padding:0px;
			}
			h1,h2,h3{
			  color:#717372;
			  font-family:'OpenSans-Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
			  line-height:1.2;
			  margin-bottom:15px;
			  margin:40px 0 10px;
			  font-weight:200;
			}
			h1{
			  font-family:'Open Sans Light';
			  font-size:45px;
			}
			h2{
			  font-size:28px;
			}
			h3{
			  font-size:22px;
			}
			p,ul,ol{
			  margin-bottom:10px;
			  font-weight:normal;
			  font-size:14px;
			}
			ul li,ol li{
			  margin-left:5px;
			  list-style-position:inside;
			}
			.container{
			  display:block!important;
			  max-width:600px!important;
			  margin:0 auto!important;
			  clear:both!important;
			}
			.body-wrap .container{
			  padding:0px;
			}
			.content,.footer-wrapper{
			  max-width:600px;
			  margin:0 auto;
			  padding:20px 33px 20px 37px;
			  display:block;
			}
			.content table{
			  width:100%;
			}
			.content-message p{
			  margin:20px 0px 20px 0px;
			  padding:0px;
			  font-size:22px;
			  line-height:38px;
			  font-family:'OpenSans-Light',Calibri, Arial, sans-serif;
			}
			.preheader{
			  display:none !important;
			  visibility:hidden;
			  opacity:0;
			  color:transparent;
			  height:0;
			  width:0;
			}
			.logo {
			 display: table;
			 margin: 0 auto;
		   }
		 </style>
	   </head>
	   
	   <body bgcolor="#f6f6f6">
		 <span class="preheader" style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
		   You’re back in the game
		 </span>
	   
		 <!-- body -->
		 <table class="body-wrap" width="600">
		   <tr>
			 <td class="container" bgcolor="#FFFFFF">
			   <!-- content -->
			   <table border="0" cellpadding="0" cellspacing="0" class="contentwrapper" width="600">
				 <tr>
				   <td style="height:25px; background: #FF9B44;">
	   
				   </td>
				 </tr>
				 <tr>
				   <td>
					 <div class="content">
					   <table class="content-message">
						 <!-- <tr>
						   <td>&nbsp;</td>
						 </tr> -->
						 <tr>
						   <td align="left">
							 <a href="http://plmadev.myperformlaw.com/">
							   <img class="logo" src="http://plmadev.myperformlaw.com/assets/pages/img/Perform_Law.png" width="250" border="0">
							 </a>
						   </td>
						 </tr>
						 <tr>
						   <td class="content-message" style="font-family:'Open Sans Light',Calibri, Arial, sans-serif; color: #595959;">
							 <p>&nbsp;</p>
							 
							 <h1 style="font-family:'OpenSans-Light', Helvetica, Calibri, Arial, sans-serif;">
							   Your new password is =  `+req.body.password+`
							 </h1>
	   
							 
							 <table width="325" border="0" cellspacing="0" cellpadding="0">
							   
					   </div>
					 </td>
				   </tr>
				   <tr>
					 <td style="height:25px; background: #FF9B44;">
					  
					 </td>
				   </tr>
				   
			   <!-- /content -->
			 </td>
			 <td></td>
		   </tr>
		 </table>
		 <!-- /body -->
	   </body>
	   
	   </html>`
    const request = sendmail
    .post("send", {
      url: 'api.mailjet.com'
    })
    .request({
      FromEmail: 'malini@wrctpl.com',
      FromName: 'plma.attorneymanagement.com',
      Subject: 'PASSWORD',
      'Html-part': email_body,
      Recipients: [{
        'Email': req.body.email
      }]
    })

}











    if (user_data === null) {
        const firm_data = await Firm.create({
            title: req.body.title,
            address: req.body.address,
            approval_level: req.body.approval_level,
            level_1 : req.body.level_1 ? req.body.level_1 : 0,
            level_2 : req.body.level_2 ? req.body.level_2 : 0,
            level_3 : req.body.level_3 ? req.body.level_3 : 0,
            level_4 : req.body.level_4 ? req.body.level_4 : 0,
        });
        if (firm_data) {
            const avatar = gravatar.url(req.body.email, {
                s: '150',
                r: 'pg',
                d: 'mm'
            });
            await User.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: bCrypt.hashSync(req.body.password),
                mobile_no: removePhoneMask(req.body.mobile_no),
                avatar,
                address: '',
                status: 1,
                approver: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                is_attorney: req.body.is_attorney ? req.body.is_attorney : 0,
                group_id: req.body.group,
                designation_id: req.body.designation,
                gender: req.body.gender,
                role_id: 2,
                firm_id: firm_data.id
            });
            res.json({
                success: true,
                message: 'Firm Created Successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Something not right. Please try again'
            });
        }
    } else {
        res.json({
            success: false,
            message: 'Email alreday taken'
        });
    }
});

router.post('/firms/edit', auth, siteAuth, csrfProtection, async (req, res) => {
    const user_data = await User.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: req.body.user_id
            }
        }
    });
    if (user_data === null) {
        await Firm.update({
            title: req.body.title,
            address: req.body.address
        }, {
            where :{
				id : req.body.firm_id
			}
        });

        await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            mobile_no: req.body.mobile_no,
            updatedAt: new Date(),
            gender: req.body.gender,
            is_attorney: req.body.is_attorney ? req.body.is_attorney : 0,
            group_id: req.body.group,
            designation_id: req.body.designation
        }, {
            where: {
                id: req.body.user_id
            }
        });
        res.json({
            success: true,
            message: 'Firm Updated Successfully'
        });
    } else {
        res.json({
            success: false,
            message: 'Email alreday taken'
        });
    }
});

router.post('/firm/delete', auth, siteAuth, csrfProtection, async (req, res) => {
    User.destroy({
        where: {
            id: req.body.user_id
        }
    });

    Firm.destroy({
        where: {
            id: req.body.firm_id
        }
    });

    req.flash('success-firm-message', 'Firm Deleted Successfully');
    res.json({
        success: true,
        message: 'Firm Deleted Successfully'
    });
});

/*======================Starts Firm Master Settings:::::Bratin Meheta 18-06-2018 & 19-06-2018========================*/

/*====================Starts Office Section 18-06-2018================================= */

router.get('/firm-details', auth, firmAuth, csrfProtection, async (req, res) => {
    var success_message = req.flash('success-firm-details-message')[0];
    Office.belongsTo(Firm, {foreignKey: 'firm_id'});
    Contact.belongsTo(Office, {foreignKey: 'office_id'});
    Contact.belongsTo(Designation, {foreignKey: 'designation_id'});
    Firm.hasMany(SectionToFirm, {foreignKey: 'firm_id'});
    Firm.hasMany(JurisdictionToFirm, {foreignKey: 'firm_id'});
    Firm.hasMany(PracticeAreaToFirm, {foreignKey: 'firm_id'});
    const office = await Office.findAll({
            where: {firm_id: req.user.firm_id},
            include: [{
            model: Firm
        }]
    });
    const designation = await Designation.findAll();
    const contact = await Contact.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{model: Office}, {model: Designation}]
    });
    const country = await Country.findAll();
    const state = await State.findAll();
    const city = await City.findAll();
    const zipcode = await Zipcode.findAll();
    const firm = await Firm.findAll({
        where: { id: req.user.firm_id },
        include: [{ model: SectionToFirm }, { model: JurisdictionToFirm }, { model: PracticeAreaToFirm }]
    });
    var state_id = firm[0].state;
    var city_id = firm[0].city;
    var firm_city = [];
    var firm_zipcode = [];
    if (state_id != null) {
        firm_city = await City.findAll({
            where: { state_id: state_id.toString() }
        });
    }
    if (city_id != null) {
        const cities = await City.findById(city_id.toString());
         firm_zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
    }
    var section = await Section.findAll();
    var practice_area = await PracticeArea.findAll();
    var jurisdiction = await Jurisdiction.findAll();

    var result = JSON.parse(JSON.stringify(firm[0].section_to_firms));
    var arr = [];
    for (var i = 0; i < result.length; i++) {
        arr.push(result[i].section_id);
    }

    var firmJurisdiction = JSON.parse(JSON.stringify(firm[0].jurisdiction_to_firms));
    var jurisdictionArr = [];
    for (var j = 0; j < firmJurisdiction.length; j++) {
        jurisdictionArr.push(firmJurisdiction[j].jurisdiction_id);
    }

    var firmPracticeArea = JSON.parse(JSON.stringify(firm[0].practice_area_to_firms));
    var PracticeAreaArr = [];
    for (var k = 0; k < firmPracticeArea.length; k++) {
        PracticeAreaArr.push(firmPracticeArea[k].practice_area_id);
    }

    res.render('firms/master_settings', { layout: 'dashboard', success_message, csrfToken: req.csrfToken(), office, designation, contact, country, state, city, zipcode, firm: firm[0], firm_city, firm_zipcode, section, practice_area, jurisdiction, arr, jurisdictionArr, PracticeAreaArr });
});

router.post('/add-office', auth, firmAuth, csrfProtection, (req, res) => {
    Office.create({
        firm_id: req.user.firm_id,
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zipcode: req.body.zipcode,
        mobile: removePhoneMask(req.body.mobile_no)
    }).then(store => {
        res.json({"add_office": true});
    });
});

router.post('/edit-office/:id', auth, firmAuth, csrfProtection, (req, res) => {
    Office.update({
        firm_id: req.user.firm_id,
        name: req.body.edit_office_name,
        address: req.body.edit_office_address,
        city: req.body.edit_office_city,
        state: req.body.edit_office_state,
        country: req.body.edit_office_country,
        zipcode: req.body.edit_office_zipcode,
        mobile: removePhoneMask(req.body.edit_office_mobile_no)
    },{ where: { id: req.params['id'] }
    }).then(edit => {
        res.json({"edit_office": true});
    });
});

router.post('/delete-office/:id', auth, firmAuth, csrfProtection, (req, res) => {
    Office.destroy({
        where: {id: req.params['id']}
    }).then(result => {
        req.flash('success-delete-office-message', 'Firm Deleted Successfully');
        res.json({"delete_office": true});
    });
});

/*====================Ends Office Section 18-06-2018================================= */

/*====================Starts Office Contact Section 19-06-2018================================= */

router.post('/add-office-contact', auth, firmAuth, csrfProtection, (req, res) => {
    Contact.create({
        office_id: req.body.office_id,
        firm_id: req.user.firm_id,
        designation_id: req.body.designation_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        mobile: removePhoneMask(req.body.mobile_no),
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zipcode: req.body.zipcode
    }).then(store => {
        res.json({"add_office_contact": true});
    });
});

router.post('/edit-office-contact/:id', auth, firmAuth, csrfProtection, (req, res) => {
    Contact.update({
        office_id: req.body.edit_office_id,
        firm_id: req.user.firm_id,
        designation_id: req.body.edit_designation_id,
        first_name: req.body.edit_contact_first_name,
        last_name: req.body.edit_contact_last_name,
        email: req.body.edit_contact_email,
        mobile: removePhoneMask(req.body.edit_contact_mobile_no),
        address: req.body.edit_contact_address,
        city: req.body.edit_contact_city,
        state: req.body.edit_contact_state,
        country: req.body.edit_contact_country,
        zipcode: req.body.edit_contact_zipcode,
    },{ where: { id: req.params['id'] }
    }).then(edit => {
        res.json({"edit_office_contact": true});
    });
});

router.post('/delete-contact/:id', auth, firmAuth, csrfProtection, (req, res) => {
    Contact.destroy({
        where: { id: req.params['id'] }
    }).then(result => {
        res.json({"delete_contact": true});
    });
});

/*====================Ends Office Contact Section 19-06-2018================================= */
/*======================Ends Firm Master Settings:::::Bratin Meheta 18-06-2018 & 19-06-2018=====================*/

/*======================edit office Get city state==========================*/
router.post('/editoffice-get/get-city', auth, (req, res) => {
    City.findAll({
        where: { state_id : req.body.state_id }
    }).then(result => {
        res.send({get_city: result});
    });
});

router.post('/edit-office-get/get-zipcode', auth, (req, res) => {
    Zipcode.findAll({
        where: { city_name : req.body.city_name }
    }).then(result => {
        res.send({zipcode: result});
    });
});
/*======================edit office Get city state==========================*/

/*======================ADD Contact Get city state==========================*/
router.post('/contact/get-city', auth, (req, res) => {
    City.findAll({
        where: { state_id : req.body.state_id }
    }).then(result => {
        res.send({get_city: result});
    });
});

router.post('/contact/get-zipcode', auth, (req, res) => {
    Zipcode.findAll({
        where: { city_name : req.body.city_name }
    }).then(result => {
        res.send({zipcode: result});
    });
});
/*======================ADD Contact Get city state==========================*/

/*======================Edit Contact Get city state==========================*/
router.post('/edit-contact-get/get-city', auth, (req, res) => {
    City.findAll({
        where: { state_id : req.body.state_id }
    }).then(result => {
        res.send({get_city: result});
    });
});

router.post('/edit-contact-get/get-zipcode', auth, (req, res) => {
    Zipcode.findAll({
        where: { city_name : req.body.city_name }
    }).then(result => {
        res.send({zipcode: result});
    });
});

/*======================Edit Contact Get city state==========================*/

/*======================Edit Contact Get city state==========================*/
router.post('/firm-basic/get-city', auth, (req, res) => {
    City.findAll({
        where: { state_id : req.body.state_id }
    }).then(result => {
        res.send({get_city: result});
    });
});

router.post('/firm-basic/get-zipcode', auth, (req, res) => {
    Zipcode.findAll({
        where: { city_name : req.body.city_name }
    }).then(result => {
        res.send({zipcode: result});
    });
});

/*======================Edit Contact Get city state==========================*/

/*==========================Firm Profile Update section=======================*/

router.post('/update-own-firm', auth, firmAuth, csrfProtection, (req, res) => {
    Firm.update({
        address: req.body.address1,
        address1: req.body.address2,
        address2: req.body.address3,
        phone_no:removePhoneMask(req.body.phone_no),
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zipcode: req.body.zipcode,
        mobile: removePhoneMask(req.body.mobile),
        fax: removePhoneMask(req.body.fax),
        website_url: req.body.web_url,
        social_url: req.body.social_url
    },{ where: { id: req.user.firm_id }
    }).then(result => {
        res.json({"update_firm": true});
    });
});

/*==========================Firm Profile Update section=======================*/

/*==========================Firm Profile Details Update section=======================*/

router.post('/update-own-firmDetails', auth, firmAuth, csrfProtection, async (req, res) => {
    var section = req.body.section;
    var practice_area = req.body.practice_area;
    var jurisdiction = req.body.jurisdiction;

    await Firm.update({
        title: req.body.firm_name,
        firm_code: req.body.firm_code,
        firm_registration: req.body.firm_reg
    },{ where: { id: req.user.firm_id}
    });

    await SectionToFirm.destroy({
        where: { firm_id : req.user.firm_id}
    });

    await PracticeAreaToFirm.destroy({
        where: { firm_id : req.user.firm_id}
    });

    await JurisdictionToFirm.destroy({
        where: { firm_id : req.user.firm_id}
    });

    for (var i = 0; i < section.length; i++) {
        await SectionToFirm.create({
            firm_id: req.user.firm_id,
            section_id: section[i]
        });
    }

    for (var j = 0; j < practice_area.length; j++) {
        await PracticeAreaToFirm.create({
            firm_id: req.user.firm_id,
            practice_area_id: practice_area[j]
        });
    }

    for (var k = 0; k < jurisdiction.length; k++) {
        await JurisdictionToFirm.create({
            firm_id: req.user.firm_id,
            jurisdiction_id: jurisdiction[k]
        });
    }
    res.json({"update_firm_details": true});
});

router.post('/update-firm-approval-process', auth, firmAuth, csrfProtection, (req, res) => {
    Firm.update({
        approval_level: req.body.level_approval,
        level_1: req.body.approver_level_desig_1,
        level_2: req.body.approver_level_desig_2,
        level_3: req.body.approver_level_desig_3,
        level_4: req.body.approver_level_desig_4
    }, {
        where: { id: req.user.firm_id }
        }).then(result => {
            res.json({ "update_firm_approval": true });
        });
});

router.post("/edit-office-city-get", auth, firmAuth, async(req, res)=> {
    const city = await City.findAll({
        where: {
            state_id: req.body.office_state
        }
    });
    const cities = await City.findById(req.body.office_city);
    const zipcode = await Zipcode.findAll({
        where: {
            city_name: cities.name
        }
    });
   res.json({
       "get_editOffice_city": true,
       "city": city,
       "zipcode" : zipcode
   });

});

/*==========================Firm Profile Details Update section=======================*/

module.exports = router;
