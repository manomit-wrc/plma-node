'use strict';
module.exports = (sequelize, DataTypes) => {
  var master_contact = sequelize.define('master_contact', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    master_contact_id: DataTypes.STRING,
    fax: DataTypes.STRING,
    master_contact_code: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    website_url: DataTypes.STRING,
    gender: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    address3: DataTypes.STRING,
    status: DataTypes.STRING,
    industry_type: DataTypes.STRING,
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
    firm_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    address_remarks: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    contact_status: DataTypes.INTEGER,
    attorney_id: DataTypes.INTEGER,
    facebook: DataTypes.STRING,
    master_contact_type:DataTypes.STRING,
    estimated_revenue :DataTypes.STRING,
    organization_name: DataTypes.STRING,
    organization_code: DataTypes.STRING

  }, {});
  master_contact.associate = function(models) {
    // associations can be defined here
  };
  return master_contact;
};
