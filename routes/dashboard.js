const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const User = require('../models').user;

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

router.get('/dashboard', auth, (req, res) => {
    res.render('dashboard', { layout: 'dashboard' });
}).get('/logout', auth, (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/profile', auth, (req, res) => {
    res.render('profile', { layout: 'dashboard' });
});

router.get('/edit-profile', csrfProtection, auth, (req, res) => {
    var success_message = req.flash('success-message')[0];
    var error_message = req.flash('error-message')[0];
    res.render('edit-profile', { layout: 'dashboard', csrfToken: req.csrfToken(),success_message:success_message, error_message:error_message  });
}).post('/edit-profile', auth, profile.single('avatar'), csrfProtection, auth, (req, res) => {
    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    User.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        gender: req.body.gender,
        address: req.body.address,
        mobile_no: req.body.mobile_no,
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

module.exports = router;