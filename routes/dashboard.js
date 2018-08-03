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
const sectionToFirm = require('../models').section_to_firms;
const PracticeArea = require('../models').practicearea;
const Designation = require('../models').designation;
const Section = require('../models').section;
const Group = require('../models').group;

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

router.get('/dashboard', auth,  (req, res) => {
    var auth_msg = req.flash('success-auth-message')[0];
    var changeFirmToAttr = req.flash('change-firm-login')[0];
    var changeAttrToFirm = req.flash('change-attr-login')[0];
    var changeSite = req.flash('change-site-login')[0];
    res.render('dashboard', {
        layout: 'dashboard',
        auth_msg: auth_msg,
        changeFirmToAttr,
        changeSite,
        changeAttrToFirm
    });
}).get('/logout', auth, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/profile', auth, async (req, res) => {
    const country = await Country.findById(req.user.country);
    const state = await State.findById(req.user.state);
    const city = await City.findById(req.user.city);
    res.render('profile', { layout: 'dashboard', country, state, city });
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

    const designation = await Designation.findAll();
    const group = await Group.findAll();
    sectionToFirm.belongsTo(Section, {
        foreignKey: 'section_id'
    });

    const allSection = await sectionToFirm.findAll({
        where: {
            firm_id: req.user.firm_id
        },
        include: [{
            model: Section
        }]
    });
    const jurisdiction = await Jurisdiction.findAll();
    const industry_type = await Industry_type.findAll();

    const country = await Country.findAll({});
    const state = await State.findAll({});
    const edata = await User.findAll({
        where: {
            id: req.user.id
        },
        include: [{
            model: Attorney_Details
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
    res.render('edit_attr_profile', {
        layout: 'dashboard',
        csrfToken: req.csrfToken(),
        country: country,
        state: state,
        success_message,
        designation: designation,
        group: group,
        section: allSection,
        jurisdiction: jurisdiction,
        industry_type: industry_type,
        edata: edata[0],
        zipcode,
        city
    });
});

router.post("/edit-attorney-profile", auth, profile.single('avatar'), csrfProtection, auth, async (req, res) => {
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
            jurisdiction: parseInt(req.body.jurisdiction),
            industry_type: parseInt(req.body.industry_type),
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
    req.flash('success-message', 'Profile updated successfully.');
    res.redirect('/edit-attorney-profile');
});

module.exports = router;