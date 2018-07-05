'use strict';
module.exports = function(sequelize, DataTypes) {
  var create - master - contact = sequelize.define('create-master-contact', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    master_contact_id: DataTypes.INTEGER,
    fax: DataTypes.STRING,
    master_contact_code: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    master_designation: DataTypes.STRING,
    website_url: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
    social_url: DataTypes.STRING,
    gender: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    address3: DataTypes.STRING,
    status: DataTypes.STRING,
    industry_type: DataTypes.STRING,
    social_security_no: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    company_name: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    google: DataTypes.STRING,
    youtube: DataTypes.STRING,
    im: DataTypes.STRING,
    address_remarks: DataTypes.TEXT,
    remarks: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return create - master - contact;
};