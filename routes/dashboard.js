const express = require('express');
const auth = require('../middlewares/auth');
const attrAuth = require('../middlewares/attr_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const User = require('../models').user;
const Firm = require('../models').firm;
const Country = require('../models').country;
const City = require('../models').city;
const State = require('../models').state;
const Zipcode = require('../models').zipcode;
const Attorney_Details = require('../models').attorney_details;
const Industry_type = require('../models').industry_type;
const Jurisdiction = require('../models').jurisdiction;
const JurisdictionToFirm = require('../models').jurisdiction_to_firms;
const JurisdictionToAttr = require('../models').jurisdiction_to_attorney;
const sectionToFirm = require('../models').section_to_firms;
const PracticeArea = require('../models').practicearea;
const Designation = require('../models').designation;
const Section = require('../models').section;
const Group = require('../models').group;
const Education = require('../models').education;
const PracticeAreaToFirm = require('../models').practice_area_to_firms;
const PracticeAreaToAttr = require('../models').practice_area_to_attorney;
const Activity = require('../models').activity;
const Target = require('../models').target;
const Client = require('../models').client;
const Referral = require('../models').referral;
const MasterContact = require('../models').master_contact;
const ActivityBudget = require('../models').activity_budget;
const ActivityGoal = require('../models').activity_goal;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var csrfProtection = csrf({ cookie: true });

const multer = require('multer');
const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/profile');
    },
    filename: function (req, file, cb) {
      fileExt = file.mimetype.split('/')[1];
      if (fileExt == 'jpeg'){ fileExt = 'jpg';}
      fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
      cb(null, fileName);
    }
})

var profile = multer({ storage: storage });

function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    return phone_no;
}

router.get('/dashboard', auth,  async(req, res) => {
    var auth_msg = req.flash('success-auth-message')[0];
    var changeFirmToAttr = req.flash('change-firm-login')[0];
    var changeAttrToFirm = req.flash('change-attr-login')[0];
    var changeSite = req.flash('change-site-login')[0];
/* =================== Activity Count starts ================================*/
    Activity.belongsTo(ActivityGoal, {
        foreignKey: 'activity_goal_id'
    });
    var activityCondition = {};
    if(req.user.role_id != "1"){
        activityCondition.firm_id = req.user.firm_id;
        if(req.user.role_id != "2"){
            activityCondition.user_id = req.user.id;
        }
    }
    var activity = await Activity.findAll({
        where: activityCondition,
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: ActivityGoal
        }],
    });
    var activity_count = activity.length;
/* =================== Activity Count Ends ================================*/
/* =================== Target Count Ends ================================*/

    var targetCondition = {};
    targetCondition.target_status = 1;
    if (req.user.role_id != "1") {
        targetCondition.firm_id = req.user.firm_id;
        if (req.user.role_id != "2") {
            targetCondition.attorney_id = req.user.id;
        }
    }
    var target = await Target.findAll({
        where: targetCondition,
        order: [
            ['createdAt', 'DESC']
        ]
    });
    var target_count = target.length;
/* =================== Target Count Ends ================================*/

/* =================== Client Count Ends ================================*/
    var clientCondition = {};
    if (req.user.role_id != "1") {
        clientCondition.firm_id = req.user.firm_id;
        if (req.user.role_id != "2") {
            clientCondition.attorney_id = req.user.id;
        }
    }
    var client = await Client.findAll({
        where: clientCondition,
        order: [
            ['createdAt', 'DESC']
        ]
    });
    var client_count = client.length;
/* =================== Client Count Ends ================================*/

/* =================== Referral Count Ends ================================*/
    Referral.belongsTo(Target, {
        foreignKey: 'target_id'
    });
    Referral.belongsTo(Client, {
        foreignKey: 'client_id'
    });
    var referralCondition = {};
    if (req.user.role_id != "1") {
        referralCondition.firm_id = req.user.firm_id;
        if (req.user.role_id != "2") {
            referralCondition.attorney_id = req.user.id;
        }
    }
    var referral = await Referral.findAll({
        where: referralCondition,
        include: [{
            model: Target
        }, {
            model: Client
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    });
    var referral_count = referral.length;
    
/* =================== Referral Count Ends ================================*/

/* =================== Master Contact Count Ends ================================*/
    var masterContatcCondition = {};
    if (req.user.role_id != "1") {
        masterContatcCondition.firm_id = req.user.firm_id;
        masterContatcCondition.contact_status = 1;
        if (req.user.role_id != "2") {
            masterContatcCondition.attorney_id = req.user.id;
        }
    }
    
    var master_contact = await MasterContact.findAll({
        where: masterContatcCondition,
        order: [
            ['createdAt', 'DESC']
        ]
    });
/* =================== Master Contact Count Ends ================================*/

/* =================== Firm Count Starts =============================================== */
    var firm = await Firm.findAll();
    var firm_count = firm.length; 
    
    User.belongsTo(Firm, {
        foreignKey: 'firm_id'
    });
    const firm_admins = await User.findAll({
        where: {
            role_id: "2"
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: Firm
        }]
    });
/* =================== Firm Count Ends =============================================== */

/* =================== Employee Count Starts =============================================== */
    var employee = await User.findAll({
        where: {
            role_id: "4"
        }
    });
    var employee_count = employee.length;     
/* =================== Employee Count Ends =============================================== */

/* =================== Attorney Count Starts =============================================== */
    var attorney = await User.findAll({
        where: {
            role_id: "3"
        }
    });
    var attorney_count = attorney.length;     
/* =================== Attorney Count Ends =============================================== */

/* =================== Total Budgets Count Starts =============================================== */
    var budgetArr = [];
    var budget = await ActivityBudget.findAll();
    for(var b = 0; b< budget.length; b++)
    {
        budgetArr.push(budget[b].amount);
    }
    var total_budget_amount = budgetArr.reduce((a, b) => a + b, 0);
/* =================== Total Budgets Count Ends =============================================== */

/* =================== Starts Chart Section ====================================================*/

    var pieChart = [];
    pieChart.push({
        y:2014,
        a:40,
        b:60
    });
    pieChart.push({
        y:2015,
        a:70,
        b:60
    })
    pieChart.push({
       y:2016,
       a:40,
       b:65
    })
    pieChart.push({
        y:2017,
        a:70,
        b:45
    })

    
/* =================== Ends Chart Section ======================================================*/
    res.render('dashboard', {
        layout: 'dashboard',
        auth_msg: auth_msg,
        changeFirmToAttr,
        changeSite,
        changeAttrToFirm,
        activity,
        activity_count,
        target,
        target_count,
        client,
        client_count,
        referral,
        referral_count,
        master_contact,
        master_contact_count: master_contact.length,
        firm_count,
        firm_admins,
        firm,
        employee_count,
        employee,
        attorney_count,
        attorney,
        total_budget_amount,
        pieChart
    });
}).get('/logout', auth, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get("/get-chart-value", auth, async(req, res)=> {
    var pieChart = [];
    pieChart.push({
        y: '2014',
        a: 40,
        b: 60
    });
    pieChart.push({
        y: '2015',
        a: 70,
        b: 60
    })
    pieChart.push({
        y: '2016',
        a: 40,
        b: 65
    })
    pieChart.push({
        y: '2017',
        a: 70,
        b: 45
    });
    res.send({
        pieChart
    });
});

router.get('/profile', auth, async (req, res) => {
        const country = await Country.findById(req.user.country);
        const state = await State.findById(req.user.state);
        const city = await City.findById(req.user.city);
        const zip = await Zipcode.findById(req.user.zipcode);
        const desig = await Designation.findById(req.user.designation_id);
        const group = await Group.findById(req.user.group_id);
        const section = await Section.findById(req.user.section_id);
        const firm = await Firm.findById(req.user.firm_id);
        const education = await Education.findAll({
            where: {
                user_id: req.user.id
            }
        })
        
        res.render('profile', {
            layout: 'dashboard',
            country,
            state,
            city,
            desig,
            group,
            section,
            zip,
            firm,
            education
        });
});

router.get('/edit-profile', csrfProtection, auth, async (req, res) => {
    const country = await Country.findAll();
    const state = await State.findAll();
    var city = [];
    var zipcode = [];
    if(req.user.state != null) {
        city = await City.findAll({
            where: {
                state_id: req.user.state.toString()
            }
        });
    }

    if(req.user.city != null) {
        const cities = await City.findById(req.user.city);
        
        zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
        
    }
    var success_message = req.flash('success-message')[0];
    var error_message = req.flash('error-message')[0];
    
    res.render('edit-profile', { layout: 'dashboard', csrfToken: req.csrfToken(),success_message, error_message, country, state, city, zipcode });

    
}).post('/edit-profile', auth, profile.single('avatar'), csrfProtection, auth, (req, res) => {
    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    User.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        zipcode: req.body.zipcode,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        gender: req.body.gender,
        address: req.body.address,
        mobile_no: removePhoneMask(req.body.mobile_no),
        dob: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
        avatar: (req.file === undefined) ? req.user.avatar : `/profile/${req.file.filename}`
    }, {
        where: {
            id: req.user.id
        }
    }).then(user => {
        req.flash('success-message', 'Profile updated successfully.');
        res.redirect('/edit-profile');
    }).catch(err => {
        console.log(err);
        req.flash('error-message', 'Something not right. Please try again.');
        res.redirect('/edit-profile');
    });
});

/*==================================Bratin Meheta 15-06-2018 ========================================*/

router.get('/change-password', auth, csrfProtection, (req, res) => {
    var change_pass = req.flash('change-pass')[0];
    res.render('change_password', { layout: 'dashboard', csrfToken: req.csrfToken(), change_pass:change_pass,});
});
router.post('/change-password', auth, csrfProtection, (req, res) => {
    User.findAll({
        where: {
            id:req.user.id
        },
        raw: true
    }).then((result) =>{
        var compare = bCrypt.compareSync( req.body.password, result[0].password);
        if(compare)
        {
            User.update({
                password: bCrypt.hashSync(req.body.new_password)
                },{where: {id: req.user.id}
            }).then((change) =>{
                req.flash('success-password-message', 'Password updated successfully, Please login again.')
                res.redirect('/logout');
            });
        }
        else
        {
            req.flash('change-pass','Current password not matched, Please enter the correct password');
            res.redirect('/change-password');
        }
    });
});

/*==================================Bratin Meheta 15-06-2018 ========================================*/

router.post('/firm-profiles/get-city', auth, (req, res) =>{
    City.findAll({
        where: { state_id : req.body.state_id}
    }).then(result => {
        res.send({get_city:result});
    });
});
router.post('/firm-profiles/get-zipcode', auth, (req, res) =>{
    Zipcode.findAll({
        where: { city_name : req.body.city_name}
    }).then(result => {
        res.send({zipcode:result});
    });
});

/*==================================Bratin Meheta 19-07-2018 (login as other role)========================================*/

router.post('/get-firm-name', auth, async (req, res)=> {
    const get_firm = await Firm.findAll();
    res.send({
        firms: get_firm
    });
});

router.get('/change-role', auth, async (req, res)=>{
    var actual_role = req.user.role_id;
    const change_role = await User.update({
        actual_role_id : actual_role,
        role_id : 3
    },{where: {id: req.user.id}});
    req.flash('change-attr-login', ' You have logged in successfully as a attorney.');
    res.redirect('/dashboard');
});

router.get('/change-role-firm', auth, async (req, res) => {
    var actual_role = req.user.actual_role_id;
    const change_role = await User.update({
        role_id: actual_role,
        actual_role_id : 0
    },{where: {id: req.user.id}});
    req.flash('change-firm-login', ' You have logged in successfully as a firm admin.');
    res.redirect('/dashboard');
});

router.post('/change-site-to-firm', auth, async(req, res) =>{
    var actual_role = req.user.role_id;
    const change_role = await User.update({
        actual_role_id: actual_role,
        role_id: 2,
        firm_id: req.body.firm_id 
    }, {
        where: {
            id: req.user.id
        }
    });
    req.flash('change-firm-login', ' You have logged in successfully as a firm admin.');
    res.redirect('/dashboard');
});

router.get('/change-role-site', auth, async (req, res)=> {
    const change_role = await User.update({
        role_id: 3
    }, {
        where: {
            id: req.user.id
        }
    });
    req.flash('change-attr-login', ' You have logged in successfully as a attorney.');
    res.redirect('/dashboard');
});

router.get('/change-role-firm-site', auth, async (req, res)=>{
    const change_role = await User.update({
        role_id: 2
    }, {
        where: {
            id: req.user.id
        }
    });
    req.flash('change-firm-login', ' You have logged in successfully as a firm admin.');
    res.redirect('/dashboard');
});

router.get('/change-role-firm-site-all', auth, async (req, res)=> {
    var actual_role = req.user.actual_role_id;
    const change_role = await User.update({
        role_id: actual_role,
        firm_id: null,
        actual_role_id: 0
    }, {
        where: {
            id: req.user.id
        }
    });
    req.flash('change-site-login', ' You have logged in successfully as a site admin.');
    res.redirect('/dashboard');
});
/*==================================Bratin Meheta 19-07-2018 ========================================*/

router.get("/edit-attorney-profile", auth, csrfProtection, attrAuth, async (req, res)=>{
    var success_message = req.flash('success-message')[0];
    User.hasMany(Attorney_Details, {
        foreignKey: 'user_id'
    });
    User.hasMany(Education, {
        foreignKey: 'user_id'
    });
    User.hasMany(PracticeAreaToAttr, {
        foreignKey: 'attorney_id'
    });
    User.hasMany(JurisdictionToAttr, {
        foreignKey: 'attorney_id'
    });
    const designation = await Designation.findAll();
    const group = await Group.findAll();
    sectionToFirm.belongsTo(Section, {
        foreignKey: 'section_id'
    });
    PracticeAreaToFirm.belongsTo(PracticeArea, {
        foreignKey: 'practice_area_id'
    });
    JurisdictionToFirm.belongsTo(Jurisdiction, {
        foreignKey: 'jurisdiction_id'
    });

    const allSection = await sectionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{
            model: Section
        }]
    });
    const allPracticeArea = await PracticeAreaToFirm.findAll({
		where: {
			firm_id: req.user.firm_id
		},

		include: [{
			model: PracticeArea
		}]
    });
    const allJurisdiction = await JurisdictionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },

        include: [{
            model: Jurisdiction
        }]
    });
    const industry_type = await Industry_type.findAll();

    const country = await Country.findAll({});
    const state = await State.findAll({});
    const edata = await User.findAll({
        where: {
            id: req.user.id
        },
        include: [{
            model: Attorney_Details
        }, {
            model: Education
        },{
			model: PracticeAreaToAttr
		}, {
		    model: JurisdictionToAttr
		}]
    });

    var state_id = edata[0].state;
    var city_id = edata[0].city;

    var city = [];
    var zipcode = [];
    if (state_id != null) {
        city = await City.findAll({
            where: {
                state_id: state_id.toString()
            }
        });
    }
    if (city_id != null) {
        const cities = await City.findById(city_id.toString());
        zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
    }
    var result = JSON.parse(JSON.stringify(edata[0].practice_area_to_attorneys));
	 var arr = [];
	 for (var i = 0; i < result.length; i++) {
	 	arr.push(result[i].practice_area_id);
     }
     var result_jurisdiction = JSON.parse(JSON.stringify(edata[0].jurisdiction_to_attorneys));
     var jurisdiction_arr = [];
     for (var i = 0; i < result_jurisdiction.length; i++) {
         jurisdiction_arr.push(result_jurisdiction[i].jurisdiction_id);
     }
    res.render('edit_attr_profile', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        country: country,
        state: state,
        success_message,
        designation: designation,
        group: group,
        section: allSection,
        industry_type: industry_type,
        edata: edata[0],
        zipcode,
        city,
        allPracticeArea,
        allJurisdiction,
        arr,
        jurisdiction_arr
    });
});

router.post("/edit-attorney-profile", auth, profile.single('avatar'), csrfProtection, auth, async (req, res) => {
    var practice_area = req.body.practice_area;
    var jurisdiction = req.body.jurisdiction;
    var education = [];
    var degree = req.body.degree;
    var university = req.body.university;
    var year = req.body.year;
    for (var d = 0; d < degree.length; d++) {
        if (degree[d] !== "") {
            var ddd = degree[d];
            var uuu = university[d];
            var yyy = year[d];
            education.push({
                "degree": ddd,
                "university": uuu,
                "year": yyy
            });
        }
    }
    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    const Firm_Join_Date1 = req.body.firm_join_date ? req.body.firm_join_date.split("-") : '';
    const Bar_Practice_date1 = req.body.bar_practice_date ? req.body.bar_practice_date.split("-") : '';
    const user_edit = await User.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        zipcode: req.body.zipcode,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        gender: req.body.gender,
        address: req.body.address,
        group_id: parseInt(req.body.group),
        section_id: parseInt(req.body.section),
        designation_id: parseInt(req.body.designation),
        mobile_no: removePhoneMask(req.body.mobile_no),
        dob: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
        avatar: (req.file === undefined) ? req.user.avatar : `/profile/${req.file.filename}`
    }, {
        where: {
            id: req.user.id
        }
    });

    const attr_other_details = await Attorney_Details.update({
        group: parseInt(req.body.group),
        section: parseInt(req.body.section),
        designation: parseInt(req.body.designation),
        attorney_id: req.body.attorney_id,
        attorney_code: req.body.attorney_code,
        attorney_type: req.body.attorney_type,
        education: req.body.education,
        bar_registration: req.body.bar_registration,
        job_type: req.body.job_type,
        jurisdiction: 0,
        industry_type: 0,
        hourly_cost: req.body.hourly_cost,
        benefit_factor: req.body.benefit_factor,
        overhead_amount: req.body.overhead_amount,
        billing_opp_cost: req.body.billing_opp_cost,
        address2: req.body.address2,
        address3: req.body.address3,
        e_mail: req.body.e_mail,
        phone_no: removePhoneMask(req.body.phone_no),
        fax: removePhoneMask(req.body.fax),
        website_url: req.body.website_url,
        social_url: req.body.social_url,
        remarks: req.body.remarks,
        firm_join_date: Firm_Join_Date1 ? Firm_Join_Date1[2] + "-" + Firm_Join_Date1[1] + "-" + Firm_Join_Date1[0] : null,
        bar_practice_date: Bar_Practice_date1 ? Bar_Practice_date1[2] + "-" + Bar_Practice_date1[1] + "-" + Bar_Practice_date1[0] : null,

    },{
        where: {
            user_id: req.user.id
        }
    });
    const del_edu = await Education.destroy({
        where: {
            user_id: req.user.id
        }
    });
    for (var e = 0; e < education.length; e++) {
        const edu = await Education.create({
            user_id: req.user.id,
            degree: education[e].degree,
            university: education[e].university,
            year: education[e].year,
        });
    }
    const del_practice = await PracticeAreaToAttr.destroy({
        where: {
            attorney_id: req.user.id
        }
    });
    for (var p = 0; p < practice_area.length; p++) {
        const practicearea = await PracticeAreaToAttr.create({
            attorney_id: req.user.id,
            firm_id: req.user.firm_id,
            practice_area_id: practice_area[p],
        });
    }
    for (var p = 0; p < jurisdiction.length; p++) {
        const jurisdictionattr = await JurisdictionToAttr.create({
            attorney_id: req.user.id,
            firm_id: req.user.firm_id,
            jurisdiction_id: jurisdiction[p],
        });
    }
    req.flash('success-message', 'Profile updated successfully.');
    res.redirect('/edit-attorney-profile');
});

router.get("/get-chart-activity-count-value", auth, async(req, res)=> {
    var activityCondition = {};
    if (req.user.role_id != "1") {
        activityCondition.firm_id = req.user.firm_id;
        if (req.user.role_id != "2") {
            activityCondition.user_id = req.user.id;
        }
    }
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var jan = [];
    var feb = [];
    var mar = [];
    var apr = [];
    var may = [];
    var jun = [];
    var jul = [];
    var aug = [];
    var sep = [];
    var oct = [];
    var nov = [];
    var dec = [];
    var jan_hour = [];
    var feb_hour = [];
    var mar_hour = [];
    var apr_hour = [];
    var may_hour = [];
    var jun_hour = [];
    var jul_hour = [];
    var aug_hour = [];
    var sep_hour = [];
    var oct_hour = [];
    var nov_hour = [];
    var dec_hour = [];
    var activity = await Activity.findAll({
        where: activityCondition
    });
    for(var i=0; i<activity.length; i++)
    {
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "January")
        {
            jan.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            jan_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "February")
        {
            feb.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            feb_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "March")
        {
            mar.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            mar_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "April")
        {
            apr.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            apr_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "May")
        {
            may.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            may_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "June")
        {
            jun.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            jun_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "July")
        {
            jul.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            jul_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "August")
        {
            aug.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            aug_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "September")
        {
            sep.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            sep_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "October")
        {
            oct.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            oct_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "November")
        {
            nov.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            nov_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (monthNames[new Date(activity[i].activity_creation_date).getMonth()] == "December")
        {
            dec.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            dec_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
    }
    var tot = [jan.length, feb.length, mar.length, apr.length, may.length, jun.length, jul.length, aug.length, sep.length, oct.length, nov.length, dec.length];
    var tot_sum = [jan.reduce((a, b) => a + b, 0), feb.reduce((a, b) => a + b, 0), mar.reduce((a, b) => a + b, 0), apr.reduce((a, b) => a + b, 0), may.reduce((a, b) => a + b, 0), jun.reduce((a, b) => a + b, 0), jul.reduce((a, b) => a + b, 0), aug.reduce((a, b) => a + b, 0), sep.reduce((a, b) => a + b, 0), oct.reduce((a, b) => a + b, 0), nov.reduce((a, b) => a + b, 0), dec.reduce((a, b) => a + b, 0)];
    var tot_hour = [jan_hour.reduce((a, b) => a + b, 0), feb_hour.reduce((a, b) => a + b, 0), mar_hour.reduce((a, b) => a + b, 0), apr_hour.reduce((a, b) => a + b, 0), may_hour.reduce((a, b) => a + b, 0), jun_hour.reduce((a, b) => a + b, 0), jul_hour.reduce((a, b) => a + b, 0), aug_hour.reduce((a, b) => a + b, 0), sep_hour.reduce((a, b) => a + b, 0), oct_hour.reduce((a, b) => a + b, 0), nov_hour.reduce((a, b) => a + b, 0), dec_hour.reduce((a, b) => a + b, 0)];

    res.send({
        success: true,
        total_activity: tot,
        total_budget: tot_sum,
        total_hour: tot_hour
    });
});

router.get("/get-chart-two-activity-count-value", auth, async(req, res)=> {
    var activityCondition = {};
    if (req.user.role_id != "1") {
        activityCondition.firm_id = req.user.firm_id;
        if (req.user.role_id != "2") {
            activityCondition.user_id = req.user.id;
        }
    }
    var year1 = [];
    var year2 = [];
    var year3 = [];
    var year4 = [];
    var year5 = [];
    var year6 = [];
    var year7 = [];
    var year8 = [];
    var year1_hour = [];
    var year2_hour = [];
    var year3_hour = [];
    var year4_hour = [];
    var year5_hour = [];
    var year6_hour = [];
    var year7_hour = [];
    var year8_hour = [];
    var activity = await Activity.findAll({
        where: activityCondition
    });

    for(var i=0; i<activity.length; i++)
    {
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2017")
        {
            year1.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year1_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2018")
        {
            year2.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year2_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2019")
        {
            year3.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year3_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2024")
        {
            year4.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year4_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2021")
        {
            year5.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year5_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2022")
        {
            year6.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year6_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2023")
        {
            year7.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year7_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
        if (new Date(activity[i].activity_creation_date).getFullYear() == "2024")
        {
            year8.push(activity[i].total_budget_amount !== null ? parseInt(activity[i].total_budget_amount) : 0);
            year8_hour.push(activity[i].total_budget_hour !== null ? parseInt(activity[i].total_budget_hour) : 0);
        }
    }
    var tot_activity = [year1.length, year2.length, year3.length, year4.length, year5.length, year6.length, year7.length, year8.length];
    var tot_amount = [year1.reduce((a, b) => a + b, 0), year2.reduce((a, b) => a + b, 0), year3.reduce((a, b) => a + b, 0), year4.reduce((a, b) => a + b, 0), year5.reduce((a, b) => a + b, 0), year6.reduce((a, b) => a + b, 0), year7.reduce((a, b) => a + b, 0), year8.reduce((a, b) => a + b, 0)];
    var tot_hour = [year1_hour.reduce((a, b) => a + b, 0), year2_hour.reduce((a, b) => a + b, 0), year3_hour.reduce((a, b) => a + b, 0), year4_hour.reduce((a, b) => a + b, 0), year5_hour.reduce((a, b) => a + b, 0), year6_hour.reduce((a, b) => a + b, 0), year7_hour.reduce((a, b) => a + b, 0), year8_hour.reduce((a, b) => a + b, 0)];
    
    res.send({
        success: true,
        total_activity: tot_activity,
        total_amount: tot_amount,
        total_hour: tot_hour
    });
    
});


router.post("/change-password-new-user", auth, async (req, res) => {
    const chngPass = await User.update({
        password: bCrypt.hashSync(req.body.new_password),
        new_user_status: 0
    },{
        where: {
            id: req.user.id
        }
    })
    res.send({
        success: true
    });
});

module.exports = router;