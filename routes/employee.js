const router = require('express').Router();
const auth = require('../middlewares/auth');
const siteAuth = require('../middlewares/site_auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const Country = require('../models').country;
const State = require('../models').state;
const City = require('../models').city;
const Zipcode = require('../models').zipcode;
const EmployeeToFirm = require('../models').employee_to_firm;

var csrfProtection = csrf({ cookie: true });
function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    phone_no = phone_no.replace("$", "");
    phone_no = phone_no.replace(",", "");
    return phone_no;
}

/*==================================BRATIN MEHETA 14-06-2018 Sayan Sadhu=====================================*/

router.get('/employees', auth, siteAuth, async (req, res) => {
    var employeeFilter = {};
    if (req.query.employee_name) {
        employeeFilter.first_name = req.query.employee_name;
    }
    if (req.query.employee_email)
    {
        employeeFilter.email = req.query.employee_email;
    }
    var success_message = req.flash('success-message')[0];
    var success_edit_message = req.flash('success-edit-message')[0];
    const users = await User.findAll({
      where:employeeFilter,
    });
    res.render('employees/index', {
        layout: 'dashboard',
        title: 'Employees Listing',
        success_message,
        employee:users,
        success_edit_message,
        employee_names: req.query.employee_name ? req.query.employee_name : '',
        employee_emails: req.query.employee_email ? req.query.employee_email : '',
    });
}).get('/employees/add', csrfProtection, siteAuth, auth, async (req, res) => {
    var error_message1 = req.flash('error-message1')[0];
    var error_message = req.flash('error-message')[0];
    const firms = await Firm.findAll({});
    const country = await Country.findAll({});
    const state = await State.findAll({});
    res.render('employees/add', {
        layout: 'dashboard',
        title: 'Add Employee',
        csrfToken: req.csrfToken(),
        firms,error_message,
        error_message1 ,
        country,
        state
    });
});

router.post('/employees/add', auth, siteAuth, csrfProtection, async (req, res) => {

// console.log('bnjhjbhjbh'+ req.body.gender);

    var firm_id = req.body.firm_id;
    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    const avatar = gravatar.url(req.body.email, {
        s: '150',
        r: 'pg',
        d: 'mm'
    });
    const data = await User.findAll({
        where: {
            email: req.body.email
        }
    });
    if(data.length === 0) {
        const employee_data = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: bCrypt.hashSync(req.body.password),
            avatar,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zipcode: req.body.zipcode,
            gender: req.body.gender,
            dob: formatDate ? formatDate[2]+"-"+formatDate[0]+"-"+formatDate[1] : null,
            mobile_no: removePhoneMask(req.body.mobile_no),
            status: 1,
            role_id: 4,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if(employee_data)
        {
            for(var i=0; i<firm_id.length; i++){
                const empToFirm = await EmployeeToFirm.create({
                    user_id: employee_data.id,
                    firm_id: firm_id[i]
                });
            }
            req.flash('success-message', 'Employee Added Successfully');
            res.redirect('/employees')
        }
        else {
            req.flash('error-message1', 'Something not right. Please try again');
            res.redirect('/employees/add');
        }
    }
    else {
        req.flash('error-message', 'Email already taken.');
        res.redirect('/employees/add');
    }
});

router.get('/employee/edit/:id', csrfProtection, siteAuth, auth, async (req, res) =>  {
    var error_edit_message = req.flash('error-edit-message')[0];
    User.hasMany(EmployeeToFirm, {foreignKey: 'user_id'});
    const users = await User.findAll({
        where: {id: req.params['id']},
        include: [{
            model: EmployeeToFirm
        }]
    });
    const firms = await Firm.findAll({});
    const country = await Country.findAll({});
    const state = await State.findAll({});
    var result = JSON.parse(JSON.stringify(users[0].employee_to_firms));
    var arr = [];
    for(var i=0; i<result.length; i++){
        arr.push(result[i].firm_id);
    }
    var state_id = users[0].state;
    var city_id = users[0].city;
    var city = [];
    var zipcode = [];
    if(state_id != null)
    {
         city = await City.findAll({
             order: [
                 ['name', 'ASC'],
             ],
            where: {state_id: state_id.toString()}
        });
    }
    if(city_id != null)
    {
        const cities = await City.findById(city_id.toString());
         zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
    }
    res.render('employees/edit', {
        layout: 'dashboard',
        title: 'Edit Employee',
        csrfToken: req.csrfToken(),
        empl: users[0],
        firms,
        error_edit_message,
        arr,
        country,
        state,
        city,
        zipcode
    });
});

router.post('/employees/edit/:id', auth, csrfProtection, async (req, res) => {
    var firms_id = req.body.firm_id;
    const formatDate1 = req.body.dob ? req.body.dob.split("-") : '';
    const user_data = await User.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: req.body.user_id
            }
        }
    });
    if (user_data === null) {
        const data = await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            updatedAt: new Date(),
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            gender: req.body.gender,
            dob: formatDate1 ? formatDate1[2] + "-" + formatDate1[0] + "-" + formatDate1[1] : null,
            mobile_no: removePhoneMask(req.body.mobile_no)
        }, {
            where: {
                id: req.params['id']
            }
        });
        const emp_to_frm_des = await EmployeeToFirm.destroy({
            where: {
                user_id: req.params['id']
            }
        });
        for (var i = 0; i < firms_id.length; i++) {
            const empToFirms = await EmployeeToFirm.create({
                user_id: req.params['id'],
                firm_id: firms_id[i]
            });
        }
        req.flash('success-edit-message', 'Employee Edited Successfully');
        res.redirect('/employees');
    } else {
        req.flash('error-edit-message', 'Email already taken.');
        res.redirect('/employees/edit/' + req.params['id']);
    }
});

router.get('/employee/view/:id', csrfProtection, siteAuth, auth, async (req, res) =>  {
    var error_edit_message = req.flash('error-edit-message')[0];
    User.hasMany(EmployeeToFirm, {foreignKey: 'user_id'});
    const users = await User.findAll({
        where: {id: req.params['id']},
        include: [{
            model: EmployeeToFirm
        }]
    });
    const firms = await Firm.findAll({});
    const country = await Country.findAll({});
    const state = await State.findAll({});
    var result = JSON.parse(JSON.stringify(users[0].employee_to_firms));
    var arr = [];
    for(var i=0; i<result.length; i++){
        arr.push(result[i].firm_id);
    }
    var state_id = users[0].state;
    var city_id = users[0].city;
    var city = [];
    var zipcode = [];
    if(state_id != null)
    {
         city = await City.findAll({
            where: {state_id: state_id.toString()}
        });
    }
    if(city_id != null)
    {
        const cities = await City.findById(city_id.toString());
         zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
    }
    res.render('employees/view', {
        layout: 'dashboard',
        title: 'View Employee',
        csrfToken: req.csrfToken(),
        empl: users[0],
        firms,
        error_edit_message,
        arr,
        country,
        state,
        city,
        zipcode
    });
});

router.get('/employee/delete/:id', auth, csrfProtection, async (req, res) => {
    const user_delete = User.destroy({
        where: { id: req.params['id'] }
    });

    const firm_to_user_delete = EmployeeToFirm.destroy({
        where: {  user_id: req.params['id']  }
    });
    req.flash('success-message', 'Employee delete Successfully');
    res.redirect('/employees');
});

module.exports = router;

/*==================================BRATIN MEHETA 14-06-2018=====================================*/
