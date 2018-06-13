const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const User = require('../models').user;
const Firm = require('../models').firm;

var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/firms', csrfProtection, auth, async (req, res) => {
    var whereStatement = {};
    if(req.query.search_email) {
        whereStatement.email = req.query.search_email;
    }
    if(req.query.search_firm) {
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

module.exports = router;