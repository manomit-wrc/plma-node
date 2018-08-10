'use strict';
module.exports = (sequelize, DataTypes) => {
  var referral = sequelize.define('referral', {
    referral_type: DataTypes.STRING,
    attorney_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    gender: DataTypes.STRING,
    estimated_revenue: DataTypes.STRING,
    address1: DataTypes.TEXT,
    address2: DataTypes.TEXT,
    address3: DataTypes.TEXT,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    address_remarks: DataTypes.TEXT,
    company_name: DataTypes.STRING,
    website_url: DataTypes.STRING,
    fax: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    im: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    social_url: DataTypes.STRING,
    google: DataTypes.STRING,
    youtube: DataTypes.STRING,
    association: DataTypes.STRING,
    industry_type: DataTypes.INTEGER,
    referred_type: DataTypes.STRING,
    target_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  referral.associate = function(models) {
    // associations can be defined here
  };
  return referral;
};