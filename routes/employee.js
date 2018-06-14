const router = require('express').Router();
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const EmployeeToFirm = require('../models').employee_to_firm;

var csrfProtection = csrf({ cookie: true });

router.get('/employees', auth, async (req, res) => {
    var success_message = req.flash('success-message')[0];
    Firm.belongsToMany(User, { through: EmployeeToFirm, as: 'users',foreignKey: 'user_id' });
    User.belongsToMany(Firm, { through: EmployeeToFirm, as: 'firms', foreignKey: 'firm_id' });
    const users = await User.findAll({
      where: {role_id: 4},  
       include: [{ all: true, nested: true}]
  });
    res.send(users);
    //res.render('employees/index', { layout: 'dashboard', success_message });
}).get('/employees/add', csrfProtection, auth, async (req, res) => {
    var error_message1 = req.flash('error-message1')[0];
    var error_message = req.flash('error-message')[0];
    const firms = await Firm.findAll({});
    res.render('employees/add', { layout: 'dashboard', csrfToken: req.csrfToken(), firms,error_message, error_message1  });
});

router.post('/employees/add', auth, csrfProtection, async (req, res) => {
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
            address: '',
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            gender: req.body.gender,
            dob: formatDate ? formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0] : null,
            mobile_no: req.body.mobile_no,
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

module.exports = router;