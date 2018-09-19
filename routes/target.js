const express = require('express');
const auth = require('../middlewares/auth');
const firmAttrAuth = require('../middlewares/firm_attr_auth');
const csrf = require('csurf');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const xlsx = require('node-xlsx');
const Designation = require('../models').designation;
const Zipcode = require('../models').zipcode;
const City = require('../models').city;
const State = require('../models').state;
const Country = require('../models').country;
const industry_type = require('../models').industry_type;
const Target = require('../models').target;
const Client = require('../models').client;
const user = require('../models').user;
const Activity = require('../models').activity;
const TargetActivity = require('../models').jointactivity;
const Referral = require('../models').referral;
const ContactInformation = require('../models').contact_information;
const Revenue = require('../models').revenue;
const Referred_Client_Targets = require('../models').referred_client_target;
var csrfProtection = csrf({
    cookie: true
});
var fs = require('fs');
const router = express.Router();

var fileExt = '';
var fileName = '';

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/target');
    },
    filename: function(req, file, cb) {
        fileExt = file.originalname.split('.')[1];
        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
})

var upload = multer({
    storage: storage
});

function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    phone_no = phone_no.replace("$", "");
    phone_no = phone_no.replace(",", "");
    return phone_no;
}

router.get('/target', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    Target.hasMany(Revenue, {
        foreignKey: 'target_id'
    });
    var success_message = req.flash('success-message')[0];
    var success_edit_message = req.flash('success-edit-message')[0];
    var industry = await industry_type.findAll();
    var country = await Country.findAll();
    const attorney = await user.findAll({
        where: {
            role_id: 3,
            firm_id: req.user.firm_id
        }
    });
    const state = await State.findAll({
        where: {
            country_id: "233"
        }
    });
    var whereCondition = {};
    if (req.query.target_type) {
        whereCondition.target_type = req.query.target_type;
    }
    if (req.query.industry_type) {
        whereCondition.industry_type = req.query.industry_type;
    }
    if (req.query.association) {
        whereCondition.association = req.query.association;
    }
    if (req.query.country) {
        whereCondition.country = req.query.country;
    }
    if (req.query.attorney) {
        whereCondition.attorney_id = req.query.attorney;
    }
    if (req.query.state) {
        var city = await City.findAll({
            where: {
                state_id: req.query.state
            }
        });
        whereCondition.state = req.query.state;
    }
    if (req.query.city) {
        const cities = await City.findById(req.query.city);
        var zipcode = await Zipcode.findAll({
            where: {
                city_name: cities.name
            }
        });
        whereCondition.city = req.query.city;
    }
    if (req.query.zipcode) {
        whereCondition.postal_code = req.query.zipcode;
    }
    whereCondition.firm_id = req.user.firm_id;
    whereCondition.target_status = 1;
    if (req.user.role_id != 2) {
        whereCondition.attorney_id = req.user.id;
    }
    
    const targetDetails = await Target.findAll({
        where: whereCondition,
        include: [{
            model: Revenue
        }]
    });
    
    res.render('target/targets', {
        layout: 'dashboard',
        title: 'Target Listing',
        csrfToken: req.csrfToken(),
        targets: targetDetails,
        searchName: req.query.searchName ? req.query.searchName : '',
        searchMail: req.query.searchEmail ? req.query.searchEmail : '',
        success_message,
        industry,
        country,
        state,
        attorney,
        success_edit_message,
        count_query: Object.keys(req.query).length,
        industry_type: req.query.industry_type ? req.query.industry_type : "",
        association: req.query.association ? req.query.association : "",
        country_search: req.query.country ? req.query.country : "",
        state_search: req.query.state ? req.query.state : "",
        city_search: req.query.city ? req.query.city : "",
        zipcode_search: req.query.zipcode ? req.query.zipcode : "",
        attr_search: req.query.attorney ? req.query.attorney : "",
        target_type_search: req.query.target_type ? req.query.target_type : "",
        city,
        zipcode
    });

});

router.get('/target/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    var error_message = req.flash('error-target-message')[0];
    var designation = await Designation.findAll({
        order: [
			['title', 'ASC']
		],
    });
    var industry = await industry_type.findAll({
        order: [
			['industry_name', 'ASC']
		],
    });
    var country = await Country.findAll();
    const state = await State.findAll({
        where: {
            country_id: "233"
        }
    });
    const attorney = await user.findAll({
        order: [
			['first_name', 'ASC'],
		],
        where: {
            role_id: 3,
            firm_id: req.user.firm_id
        }
    });
    res.render('target/addtarget', {
        layout: 'dashboard',
        title: 'Add Target',
        csrfToken: req.csrfToken(),
        country: country,
        state: state,
        designations: designation,
        industry: industry,
        attorney: attorney,
        error_message
    });
});

router.post('/target/add', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    var targetDetails = [];
	var first_name = req.body.targetDetailsFirstName;
	var last_name = req.body.targetDetailsSecondName;
	var gender = req.body.targetDetailsGender;
	var email = req.body.targetDetailsEmail;
	var phone_no = req.body.targetDetailsPhone_no;
	var fax = req.body.targetDetailsFax;
    var mobile_no = req.body.targetDetailsMobile_no;

    const startDate = req.body.targetStartDate ? req.body.targetStartDate.split("-") : '';
    const endDate = req.body.end_date ? req.body.end_date.split("-") : '';
    const targetCloseDate = req.body.targetCloseDate ? req.body.targetCloseDate.split("-") : '';

    let length = first_name.length;
	for (let i=0; i< length; i++) {
		if (first_name[i]!=="") {
			targetDetails.push({
				"first_name":first_name[i],
				"last_name":last_name[i],
				"gender":gender[i],
				"email":email[i],
				"phone_no":removePhoneMask(phone_no[i]),
				"fax":removePhoneMask(fax[i]),
				"mobile_no":removePhoneMask(mobile_no[i])
			});
		}
	}

    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    const target_data = await Target.findOne({
        where: {
            email: req.body.email
        }
    });
    if (target_data === null) {
        if (req.body.target_type === "O") {
            const insertData = await Target.create({
                organization_name: req.body.org_name,
                organization_id: req.body.org_id,
                organization_code: req.body.org_code,
                email: req.body.email,
                phone_no: removePhoneMask(req.body.phone_no),
                fax: removePhoneMask(req.body.fax),
                mobile_no: removePhoneMask(req.body.mobile_no),
                address1: req.body.address1,
                address2: req.body.address2,
                address3: req.body.address3,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                postal_code: req.body.zipcode,
                address_remarks: req.body.address_remarks,
                company_name: req.body.company_name,
                attorney_id: req.body.attorney_id,
                website_url: req.body.website_url,
                social_url: req.body.social_url,
                twitter: req.body.twitter,
                linkedin: req.body.linkedin,
                youtube: req.body.youtube,
                google: req.body.google,
                im: req.body.im,
                association: req.body.association,
                industry_type: req.body.industry_type,
                remarks: req.body.remarks,
                firm_id: req.user.firm_id,
                user_id: req.user.id,
                target_type: req.body.target_type,
                estimated_lifetime_value: removePhoneMask(req.body.life_time_revenue),
                close_date: targetCloseDate ? targetCloseDate[2] + "-" + targetCloseDate[0] + "-" + targetCloseDate[1] : null,
                
                // estimated_revenue: removePhoneMask(req.body.estimated_revenue),
                // revenue_start_month: req.body.startMonth,
                // revenue_end_month: req.body.endMonth,
                // //targetEndDate: endDate ? endDate[2] + "-" + endDate[1] + "-" + endDate[0] : null,
            });

            for (let j=0; j< targetDetails.length; j++) {
				await ContactInformation.create({
					first_name: targetDetails[j].first_name,
					last_name: targetDetails[j].last_name,
					gender: targetDetails[j].gender,
					email: targetDetails[j].email,
					mobile_no: targetDetails[j].mobile_no,
					phone_no: targetDetails[j].phone_no,
					fax: targetDetails[j].fax,
					type: 'M',
					contact_id: insertData.id
				});
			} 
            const revenueaddo = await Revenue.create({
                type:"T",
                target_id: insertData.id,
                planning_period: req.body.planning_period,
                start_date: startDate ? startDate[2] + "-" + startDate[0] + "-" + startDate[1] : null,
                end_date: endDate ? endDate[2] + "-" + endDate[0] + "-" + endDate[1] : null,
                estimated_revenue: removePhoneMask(req.body.estimated_revenue),
                user_id:req.user.id,
                firm_id: req.user.firm_id
            });
            req.flash('success-message', 'Target Added Successfully');
            res.redirect('/target')

        } else {
            const indidata = await Target.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[0] + "-" + formatDate[1] : null,
                gender: req.body.gender,
                target_id: req.body.target_id,
                target_code: req.body.target_code,
                designation_id: req.body.designation,
                email: req.body.email,
                phone_no: removePhoneMask(req.body.phone_no),
                fax: removePhoneMask(req.body.fax),
                mobile_no: removePhoneMask(req.body.mobile_no),
                address1: req.body.address1,
                address2: req.body.address2,
                address3: req.body.address3,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                postal_code: req.body.zipcode,
                address_remarks: req.body.address_remarks,
                company_name: req.body.company_name,
                attorney_id: req.body.attorney_id,
                website_url: req.body.website_url,
                social_url: req.body.social_url,
                twitter: req.body.twitter,
                linkedin: req.body.linkedin,
                youtube: req.body.youtube,
                google: req.body.google,
                im: req.body.im,
                remarks: req.body.remarks,
                association: req.body.association,
                industry_type: req.body.industry_type,
                firm_id: req.user.firm_id,
                user_id: req.user.id,
                target_type: req.body.target_type,
                estimated_lifetime_value: req.body.life_time_revenue,
                close_date: targetCloseDate ? targetCloseDate[2] + "-" + targetCloseDate[0] + "-" + targetCloseDate[1] : null,
                // estimated_revenue: removePhoneMask(req.body.estimated_revenue),
                // revenue_start_month: req.body.startMonth,
                // revenue_end_month: req.body.endMonth,
                // estimated_lifetime_value: removePhoneMask(req.body.estimatedLifetime),
                // close_date: startDate ? startDate[2] + "-" + startDate[1] + "-" + startDate[0] : null,
                // targetEndDate: endDate ? endDate[2] + "-" + endDate[1] + "-" + endDate[0] : null,
            });

            const revenueadd = await Revenue.create({
                type: "T",
                target_id: indidata.id,
                planning_period: req.body.planning_period,
                start_date: startDate ? startDate[2] + "-" + startDate[0] + "-" + startDate[1] : null,
                end_date: endDate ? endDate[2] + "-" + endDate[0] + "-" + endDate[1] : null,
                estimated_revenue: removePhoneMask(req.body.estimated_revenue),
                user_id: req.user.id,
                firm_id: req.user.firm_id
            });
            req.flash('success-message', 'Target Added Successfully');
            res.redirect('/target')
        }
    } else {
        req.flash('error-target-message', 'Email already taken.');
        res.redirect('/target/add');
    }
});

router.get('/target/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    Target.hasMany(Revenue, {
        foreignKey: 'target_id'
    });
    var error_message = req.flash('error-target-message')[0];
    const target = await Target.findOne({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Revenue
        }]  
    });
    const designation = await Designation.findAll({
        order: [
			['title', 'ASC']
		],
    });
    const industrys = await industry_type.findAll({
        order: [
			['industry_name', 'ASC']
		],
    });
    const country = await Country.findAll();
    const state = await State.findAll({
        where: {
            country_id: "233"
        }
    });
    const city = await City.findAll({
        where: {
            state_id: target.state.toString()
        }
    });
    const cities = await City.findById(target.city.toString());
    const zipcode = await Zipcode.findAll({
        where: {
            city_name: cities.name
        }
    });
    const attorney = await user.findAll({
        order: [
			['first_name', 'ASC'],
		],
        where: {
            role_id: 3,
            firm_id: req.user.firm_id
        }
    });

    var fetchReferral = {};
    var referralListArr = [];
    if (req.user.role_id != 2) {
		fetchReferral.attorney_id = req.user.id;
		fetchReferral.firm_id = req.user.firm_id;
	} else {
		fetchReferral.firm_id = req.user.firm_id;
    }
    
    const referral = await Referral.findAll({
		order: [
			['first_name', 'ASC'],
		],
		where: fetchReferral
    });
    
    const referralDetails = await Referred_Client_Targets.findAll({
		where: {
			target_id: req.params['id']
		}
	});
	
	for (var i = 0; i < referralDetails.length; i++) {
        const referDetails = await Referral.findOne({
            where: {
                id: referralDetails[i].referral_id
            }
        });
        referralListArr.push({
            "name": referDetails.first_name + " " + referDetails.last_name,
            "email": referDetails.email
        });
	}

    const contactDetails = await ContactInformation.findAll({
		where: {
			'contact_id': req.params['id']
		}
    });
    
    res.render('target/targetupdate', {
        layout: 'dashboard',
        title: 'Edit Target',
        csrfToken: req.csrfToken(),
        attorney: attorney,
        designation: designation,
        industry: industrys,
        client: target,
        country: country,
        state: state,
        city: city,
        zipcode: zipcode,
        error_message,
        contactDetails,
        referral,
        referralListArr,
        referralDetails
    });
});

router.get('/target/view/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    Target.hasMany(Revenue, {
        foreignKey: 'target_id'
    });
    var error_message = req.flash('error-target-message')[0];
    const target = await Target.findOne({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Revenue
        }]
    });
    const designation = await Designation.findAll();
    
    // const country = await Country.findAll();
    const attorney = await user.findAll({
        where: {
            role_id: 3,
            firm_id: req.user.firm_id
        }
    });
    // const state = await State.findAll({
    //     where: {
    //         country_id: "233"
    //     }
    // });
    // const city = await City.findAll({
    //     where: {
    //         state_id: target.state.toString()
    //     }
    // });
    // const cities = await City.findById(target.city.toString());
    // const zipcode = await Zipcode.findAll({
    //     where: {
    //         city_name: cities.name
    //     }
    // });

    const contactDetails = await ContactInformation.findAll({
		where: {
			'contact_id': req.params['id']
		}
    });
    TargetActivity.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });
    const activity_details = await TargetActivity.findAll({
        where: {
            target_client_type: "T",
            type: req.params['id']
        },
        include: [{
            model: Activity
        }]
    });
    const country = await Country.findById("233");
    const state = await State.findById(target.state.toString());
    const city = await City.findById(target.city.toString());
    const zip = await Zipcode.findById(target.postal_code.toString());
    const industrys = await industry_type.findById(target.industry_type.toString());
    
    res.render('target/targetview', {
        layout: 'dashboard',
        title: 'View Target',
        csrfToken: req.csrfToken(),
        designation: designation,
        industrys,
        client: target,
        country: country,
        state: state,
        city: city,
        attorney: attorney,
        zipcode: zip,
        error_message,
        contactDetails,
        count_activity: activity_details.length,
        activity_details
    });
});

router.post('/target/edit/:id', auth, firmAttrAuth, csrfProtection, async(req, res) => {
    var contactDetails = [];
	var first_name = req.body.contactDetailsFirstName;
	var last_name = req.body.contactDetailsSecondName;
	var gender = req.body.contactDetailsGender;
	var email = req.body.contactDetailsEmail;
	var phone_no = req.body.contactDetailsPhone_no;
	var fax = req.body.contactDetailsFax;
    var mobile_no = req.body.contactDetailsMobile_no;
    
   const startDate = req.body.targetStartDate ? req.body.targetStartDate.split("-") : '';
   const endDate = req.body.end_date ? req.body.end_date.split("-") : '';
   const targetCloseDate = req.body.targetCloseDate ? req.body.targetCloseDate.split("-") : '';

	let length = first_name.length;
	for (let i=0; i< length; i++) {
		if (first_name[i]!=="") {
			contactDetails.push({
				"first_name":first_name[i],
				"last_name":last_name[i],
				"gender":gender[i],
				"email":email[i],
				"phone_no":removePhoneMask(phone_no[i]),
				"fax":removePhoneMask(fax[i]),
				"mobile_no":removePhoneMask(mobile_no[i])
			});
		}
	}


    const formatDate = req.body.dob ? req.body.dob.split("-") : '';
    const target_edit_data = await Target.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: req.params['id']
            }
        }
    });
    
    if (target_edit_data === null) {
        await Target.update({
            organization_name: req.body.org_name,
            organization_id: req.body.org_id,
            organization_code: req.body.org_code,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_no: removePhoneMask(req.body.phone_no),
            mobile_no: removePhoneMask(req.body.mobile_no),
            fax: removePhoneMask(req.body.fax),
            address1: req.body.address1,
            address2: req.body.address2,
            address3: req.body.address3,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            postal_code: req.body.zipcode,
            address_remarks: req.body.address_remarks,
            designation_id: req.body.designation,
            company_name: req.body.company_name,
            attorney_id: req.body.attorney,
            website_url: req.body.website_url,
            social_url: req.body.social_url,
            twitter: req.body.twitter,
            linkedin: req.body.linkedin,
            youtube: req.body.youtube,
            google: req.body.google,
            association: req.body.association,
            industry_type: req.body.industry_type,
            firm_id: req.user.firm_id,
            im: req.body.im,
            date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[0] + "-" + formatDate[1] : null,
            gender: req.body.gender,
            target_id: req.body.target_id,
            target_code: req.body.target_code,
            remarks: req.body.remarks,
            estimated_lifetime_value: removePhoneMask(req.body.life_time_revenue),
            close_date: targetCloseDate ? targetCloseDate[2] + "-" + targetCloseDate[0] + "-" + targetCloseDate[1] : null,
            // estimated_revenue: removePhoneMask(req.body.estimated_revenue),
            // estimated_lifetime_value: removePhoneMask(req.body.estimatedLifetime),
            // revenue_start_month: req.body.startMonth,
            // revenue_end_month: req.body.endMonth,
            // close_date: startDate ? startDate[2] + "-" + startDate[1] + "-" + startDate[0] : null,
            // targetEndDate: endDate ? endDate[2] + "-" + endDate[1] + "-" + endDate[0] : null,
        }, {
            where: {
                id: req.params['id']
            }
            
        });

        const revenueupdate = await Revenue.update({
            type: "T",
            planning_period: req.body.planning_period,
            start_date: startDate ? startDate[2] + "-" + startDate[0] + "-" + startDate[1] : null,
            end_date: endDate ? endDate[2] + "-" + endDate[0] + "-" + endDate[1] : null,
            estimated_revenue: removePhoneMask(req.body.estimated_revenue)
        },{
            where:{
                target_id: req.params['id']
            } 
                
        });
            
        await ContactInformation.destroy({
			where: {
				contact_id: req.params['id']
			}
		});

        for (let j=0; j< contactDetails.length; j++) {
            await ContactInformation.create({
                first_name: contactDetails[j].first_name,
                last_name: contactDetails[j].last_name,
                gender: contactDetails[j].gender,
                email: contactDetails[j].email,
                mobile_no: contactDetails[j].mobile_no,
                phone_no: contactDetails[j].phone_no,
                fax: contactDetails[j].fax,
                type: 'M',
                contact_id: req.params['id']
            });
        } 

        req.flash('success-message', 'Target Updated Successfully');
        res.redirect('/target');
    } else {
        req.flash('error-target-message', 'Email already taken.');
        res.redirect('/target/edit/' + req.params['id']);
    }
});

router.get('/target/delete/:id', auth, firmAttrAuth, async(req, res) => {
    await Target.destroy({
        where: {
            id: req.params['id']
        }
    });
    await Revenue.destroy({
        where: {
            target_id: req.params['id']
        }
    })
    req.flash('success-message', 'Target Deleted Successfully');
    res.redirect('/target');
});

router.post('/target/multi-delete/', auth, firmAttrAuth, async(req, res) => {

    var target_ids = req.body.target_id;
    var n = req.body.target_id.length;
    for (i = 0; i < n; i++) {

        await Target.destroy({
            where: {
                id: target_ids[i]
            }
        });
    }
    res.json({
        code: "200",
        message: 'Success'
    });
});

function convertToJSON(array) {
    var first = array[0].join()
    var headers = first.split(',');
    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++) {
        var myRow = array[i].join();
        var row = myRow.split(',');
        var data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);
    }
    return jsonData;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

router.post('/target/import', auth, upload.single('file_name'), csrfProtection, async(req, res) => {
    var target_xl = xlsx.parse(fs.readFileSync('public/target/' + fileName));
    var importedData = JSON.stringify(convertToJSON(target_xl[0].data));
    var excelTarget = JSON.parse(importedData);
    for (var i = 0; i < excelTarget.length; i++) {
        const formatDate = excelTarget[i].dob ? excelTarget[i].dob.split("-") : '';
        var excel_state = excelTarget[i].state.capitalize();
        var excel_city = excelTarget[i].city.capitalize();
        var excel_zip = excelTarget[i].zipcode.capitalize();
        var fetchState = [];
        var fetchCity = [];
        var fetchZip = [];
        if (excelTarget[i].state !== null) {
            var fetchState = await State.findAll({
                where: {
                    name: excel_state
                }
            });
        }
        if (excelTarget[i].city !== null) {
            var fetchCity = await City.findAll({
                where: {
                    name: excel_city
                }
            });
        }
        if (excelTarget[i].zipcode !== null) {
            var fetchZip = await Zipcode.findAll({
                where: {
                    zip: excel_zip
                }
            });
        }
        const target_excel_data = await Target.findOne({
            where: {
                email: excelTarget[i].email
            }
        });
        if (target_excel_data === null) {
            if (excelTarget[i].target_type == "organization") {
                await Target.create({
                    organization_name: excelTarget[i].oraganisation_name,
                    organization_id: excelTarget[i].organisation_id,
                    organization_code: excelTarget[i].organisation_code,
                    email: excelTarget[i].email,
                    mobile_no: excelTarget[i].mobile,
                    fax: excelTarget[i].fax,
                    address1: excelTarget[i].address1,
                    address2: excelTarget[i].address2,
                    address3: excelTarget[i].address3,
                    country: 233,
                    state: fetchState[0].id,
                    city: fetchCity[0].id,
                    pin_code: fetchZip[0].id,
                    IM: excelTarget[i].im,
                    company_name: excelTarget[i].company_name,
                    twitter: `http://${excelTarget[i].twitter}`,
                    linkedin: `http://${excelTarget[i].linkedin}`,
                    youtube: `http://${excelTarget[i].youtube}`,
                    google: `http://${excelTarget[i].google}`,
                    firm_id: req.user.firm_id,
                    user_id: req.user.id,
                    target_type: "O",
                    remarks: excelTarget[i].edit_remarks
                });
            } else {
                await Target.create({
                    first_name: excelTarget[i].first_name,
                    last_name: excelTarget[i].last_name,
                    target_id: excelTarget[i].target_id,
                    target_code: excelTarget[i].master_id,
                    date_of_birth: formatDate ? formatDate[2] + "-" + formatDate[0] + "-" + formatDate[1] : null,
                    gender: excelTarget[i].gender,
                    email: excelTarget[i].email,
                    mobile_no: excelTarget[i].mobile,
                    fax: excelTarget[i].fax,
                    address1: excelTarget[i].address1,
                    address2: excelTarget[i].address2,
                    address3: excelTarget[i].address3,
                    country: 233,
                    state: fetchState[0].id,
                    city: fetchCity[0].id,
                    pin_code: fetchZip[0].id,
                    firm_id: req.user.firm_id,
                    user_id: req.user.id,
                    IM: excelTarget[i].im,
                    company_name: excelTarget[i].company_name,

                    twitter: `http://${excelTarget[i].twitter}`,
                    linkedin: `http://${excelTarget[i].linkedin}`,
                    youtube: `http://${excelTarget[i].youtube}`,
                    google: `http://${excelTarget[i].google}`,
                    target_type: "I",
                    remarks: excelTarget[i].remarks
                });
            }
        }
    }
    req.flash('success-message', 'Target Imported Successfully');
    res.redirect('/target');
});

router.post('/target/move-to-client', auth, async(req, res) => {
    
    var target_ids = req.body.target_id;
    var n = req.body.target_id.length;
    var clientDetails;

    for (let j = 0; j < n; j++) {
        const targetDetails = await Target.findOne({
            where: {
                'id': target_ids[j]
            }
        });

        clientDetails = await Client.findAll({
            where: {
                'email': targetDetails.email
            }
        });
    }

    if (clientDetails.length > 0) {
        res.json({
            code: "300",
            message: 'Not Success'
        });

    } else {
        for (i = 0; i < n; i++) {

            await Target.update({
                target_status: '0'
            }, {
                where: {
                    'id': target_ids[i]
                }
            });

            var target_data = await Target.findOne({
                where: {
                    id: target_ids[i]
                }
            });

            var moveClient = await Client.create({
                first_name: target_data.first_name,
                last_name: target_data.last_name,
                email: target_data.email,
                mobile_no: target_data.mobile_no,
                fax: target_data.fax,
                address1: target_data.address1,
                address2: target_data.address2,
                address3: target_data.address3,
                country: target_data.country,
                state: target_data.state,
                city: target_data.city,
                pin_code: target_data.postal_code,
                firm_id: target_data.firm_id,
                designation_id: target_data.designation_id,
                type: target_data.type,
                association_type: target_data.association,
                industry_type: target_data.industry_type,
                company_name: target_data.company_name,
                twitter: target_data.twitter,
                linkedin: target_data.linkedin,
                youtube: target_data.youtube,
                google: target_data.google,
                client_id: target_data.target_id,
                master_id: target_data.target_code,
                gender: target_data.gender,
                tag_type: "n",
                tags: "new",
                date_of_birth: target_data.date_of_birth,
                IM: target_data.im,
                organization_name: target_data.organization_name,
                organization_id: target_data.organization_id,
                organization_code: target_data.organization_code,
                user_id: target_data.user_id,
                client_type: target_data.target_type,
                remarks: target_data.remarks,
                attorney_id: req.user.id,
                life_time_revenue: target_data.estimated_lifetime_value,
                //revenueclosingDate: target_data.close_date
                // revenueclosingDate: target_data.revenueclosingDate,

            });
            await Revenue.create({
                type: "C",
                client_id: moveClient.id,
                start_date: new Date()
            });

            await Target.update({
                status: '0'
            }, {
                where: {
                    id: target_ids[i]
                }
            });
        }
        res.json({
            code: "200",
            message: 'Success'
        });
    }
});

// Starts all  asssociated activitsies for target and client
router.get("/target/view-activity/:id", auth, async(req, res) => {
    TargetActivity.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });
    const activity_details = await TargetActivity.findAll({
        where: {
            target_client_type: "T",
            type: req.params['id']
        },
        include: [{
            model: Activity
        }]
    });
    res.render("target/view_activity", {
        layout: 'dashboard',
        title: 'View Activity',
        activity_details
    });
});

router.get("/client/view-activity/:id", auth, async(req, res) => {
    TargetActivity.belongsTo(Activity, {
        foreignKey: 'activity_id'
    });
    const activity_details = await TargetActivity.findAll({
        where: {
            target_client_type: "C",
            type: req.params['id']
        },
        include: [{
            model: Activity
        }]
    });
    res.render("client/view_client_activity", {
        layout: 'dashboard',
        title: 'View Client Activity',
        activity_details
    });
});

// start associate referral 

router.get("/target/view-referral/:id", auth, firmAttrAuth, async(req, res) => {
    const referral = await Referral.findAll({
        where: {
            referred_type: "T",
            target_id: req.params['id']
        }
    });
    res.render("target/view_referral", {
        layout: 'dashboard',
        title: 'View Referral Source',
        referral
    });
});

router.get("/client/view-referral/:id", auth, firmAttrAuth, async(req, res) => {
    const referral = await Referral.findAll({
        where: {
            referred_type: "C",
            client_id: req.params['id']
        }
    });
    res.render("client/view_referral", {
        layout: 'dashboard',
        title: 'View Referral Source',
        referral
    });
});

router.post("/target/referraladd", auth, csrfProtection, async (req, res) => {
    await Referred_Client_Targets.create({
        'type': 'T',
        'target_id': parseInt(req.body.target_id),
        'client_id': 0,
        'referral_id': parseInt(req.body.referral_id),
        'status': 1
    });
    res.json({
		code: "200",
		message: 'Success'
	});
});

module.exports = router;