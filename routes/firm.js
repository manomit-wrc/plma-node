const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;
const Office = require('../models').office;
const Designation = require('../models').designation;
const Contact = require('../models').office_contact;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/firms', csrfProtection, auth, async (req, res) => {
    var whereStatement = {};
    if(req.query.search_email) {
        whereStatement.email = req.query.search_email;
    }
    if(req.query.search_firm)
    {
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
     
    res.render('firms/index', { 
        layout: 'dashboard', 
        csrfToken: req.csrfToken(), 
        users, 
        firms, 
        search_email: req.query ? req.query.search_email : '', 
        search_firm: req.query ? req.query.search_firm : ''
    });
});
router.post('/firms/add', auth, csrfProtection, async (req, res) => {
    const user_data = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(user_data === null) {
        const firm_data = await Firm.create({ title: req.body.title, address: req.body.address });
        if(firm_data) {
            const avatar = gravatar.url(req.body.email, {
                s: '150',
                r: 'pg',
                d: 'mm'
            });
            const data = await User.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: bCrypt.hashSync(req.body.password),
                mobile_no: req.body.mobile_no,
                avatar,
                address: '',
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                gender: req.body.gender,
                role_id: 2,
                firm_id: firm_data.id
            });
            res.json({
                success: true,
                message: 'Firm created successfully'
            });
        }
        else {
            res.json({
                success: false,
                message: 'Something not right. Please try again'
            });
        }
    }
    else {
        res.json({
            success: false,
            message: 'Email alreday taken'
        });
    }
    
});

router.post('/firms/edit', auth, csrfProtection, async (req, res) => {
    const user_data = await User.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: req.body.user_id
            }
        }
    });
    if(user_data === null) {
        const firms = await Firm.update({
            title: req.body.title, 
            address: req.body.address
        }, {
            where :{
				id : req.body.firm_id
			}
        });

        const data = await User.update({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: bCrypt.hashSync(req.body.password),
                mobile_no: req.body.mobile_no,
                updatedAt: new Date(),
                gender: req.body.gender
        }, {
            where: {
                id: req.body.user_id
            }
        });

        res.json({
            success: true,
            message: 'Firm updated successfully'
        });
    }
    else {
        res.json({
            success: false,
            message: 'Email alreday taken'
        });
    }
}); 

router.post('/firm/delete', auth, csrfProtection, async (req, res) => {
    const user_delete = User.destroy({
        where: {
            id: req.body.user_id
        }
    });

    const firm_delete = Firm.destroy({
        where: {
            id: req.body.firm_id
        }
    });

    res.json({
        success: true,
        message: 'Firm deleted successfully'
    });
});


/*======================Starts Firm Master Settings:::::Bratin Meheta 18-06-2018 & 19-06-2018========================*/

/*====================Starts Office Section 18-06-2018================================= */

router.get('/firm-details', auth, csrfProtection, (req, res) => {
    Office.belongsTo(Firm, {foreignKey: 'firm_id'});
    Contact.belongsTo(Office, {foreignKey: 'office_id'});
    Contact.belongsTo(Designation, {foreignKey: 'designation_id'});
    Promise.all([
        Office.findAll(
            {
                include: [{
                model: Firm
            }]
        }),
        Designation.findAll(),
        Contact.findAll({
            include: [{model: Office}, {model: Designation}]
        })
    ]).then(show =>{
        res.render('firms/master_settings', {layout: 'dashboard', csrfToken: req.csrfToken(), office: show[0], designation: show[1], contact: show[2]});
    })
});

router.post('/add-office', auth, csrfProtection, (req, res) => {
    Office.create({
        firm_id: 5,
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        mobile: req.body.mobile_no
    }).then(store => {
        res.json({"add_office":true});
    });
});

router.post('/edit-office/:id', auth, csrfProtection, (req, res) => {
    Office.update({
        firm_id: 5,
        name: req.body.edit_office_name,
        address: req.body.edit_office_address,
        city: req.body.edit_office_city,
        state: req.body.edit_office_state,
        country: req.body.edit_office_country,
        mobile: req.body.edit_office_mobile_no
    },{ where: {id: req.params['id']}
    }).then(edit => {
        res.json({"edit_office":true});
    });
});

router.post('/delete-office/:id', auth, csrfProtection, (req, res) =>{
    Office.destroy({
        where: {id: req.params['id']}
    }).then(result =>{
        res.json({"delete_office":true});
    });
});
/*====================Ends Office Section 18-06-2018================================= */

/*====================Starts Office Contact Section 19-06-2018================================= */

router.post('/add-office-contact', auth, csrfProtection, (req, res) => {
    Contact.create({
        office_id: req.body.office_id,
        designation_id: req.body.designation_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        mobile: req.body.mobile_no,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
    }).then(store => {
        res.json({"add_office_contact": true});
    });
});

router.post('/edit-office-contact/:id', auth, csrfProtection, (req, res) => {
    Contact.update({
        office_id: req.body.edit_office_id,
        designation_id: req.body.edit_designation_id,
        first_name: req.body.edit_contact_first_name,
        last_name: req.body.edit_contact_last_name,
        email: req.body.edit_contact_email,
        mobile: req.body.edit_contact_mobile_no,
        address: req.body.edit_contact_address,
        city: req.body.edit_contact_city,
        state: req.body.edit_contact_state,
        country: req.body.edit_contact_country,
    },{where: {id: req.params['id']}
    }).then(edit => {
        res.json({"edit_office_contact": true});
    });
});

router.post('/delete-contact/:id', auth, csrfProtection, (req, res) =>{
    Contact.destroy({
        where: {id: req.params['id']}
    }).then(result =>{
        res.json({"delete_contact":true});
    });
});

/*====================Ends Office Contact Section 19-06-2018================================= */
/*======================Ends Firm Master Settings:::::Bratin Meheta 18-06-2018 & 19-06-2018=====================*/

module.exports = router;