const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const designation = require('../models').designation;
var csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get('/designations', csrfProtection, auth, (req, res) => {
    designation.findAll().then(rows => {
      // console.log(JSON.stringify(rows,undefined,2));
        res.render('designations/index', { layout: 'dashboard', csrfToken: req.csrfToken(), rows:  rows  });
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
          res.end("Success");
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
router.get('/designations/update/:id',auth,csrfProtection, (req,res) => {
  designation.findById(req.params.id).then(row => {
    console.log(JSON.stringify(row,undefined,10));
    res.render('designations/updatedesignation',{layout: 'dashboard', csrfToken: req.csrfToken(), designation: row});
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
    if(result.count > 0){
      res.json({msg: 'ERRR'});
    }else{
      designation.update({code: code,title: title,remarks: remarks},{where:{id: req.params.id}}).then(resp => {
        res.end("success");
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
    res.redirect('/designations');
  });
});
router.post('/designations/search',auth, (req,res) => {
  var code = req.body.code;
  var title = req.body.title;

  if(code == ""){
    designation.findAndCountAll({
      where: {

        title: req.body.title
      }
    }).then(rows => {
      console.log(rows.count);
      // res.end(rows.count);
      res.json({searchData: rows.rows});
    });
  }else if(title == ""){
    designation.findAndCountAll({
      where: {
        code: req.body.code

      }
    }).then(rows => {
      console.log(rows.count);
      // res.end(rows.count);
      res.json({searchData: rows.rows});
    });
  }else{
    designation.findAndCountAll({
      where: {
        code: req.body.code,
        title: req.body.title
      }
    }).then(rows => {
      console.log(rows.count);
      // res.end(rows.count);
      res.json({searchData: rows.rows});
    });
  }


});
module.exports = router;
