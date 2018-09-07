'use strict';
module.exports = (sequelize, DataTypes) => {
  var target = sequelize.define('target', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    firm_id: DataTypes.INTEGER,
    designation_id: DataTypes.STRING,
    company_name: DataTypes.STRING,
    fax: DataTypes.STRING,
    twitter: DataTypes.STRING,
    facebook: DataTypes.STRING,
    google: DataTypes.STRING,
    association: DataTypes.STRING,
    industry_type: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
    gender: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    youtube: DataTypes.STRING,
    target_id: DataTypes.STRING,
    target_code: DataTypes.STRING,
    status: DataTypes.STRING,
    social_security_no: DataTypes.STRING,
    im: DataTypes.STRING,
    remarks: DataTypes.STRING,
    website_url: DataTypes.STRING,
    social_url: DataTypes.STRING,
    address3: DataTypes.STRING,
    address_remarks: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    organization_id: DataTypes.STRING,
    organization_code: DataTypes.STRING,
    target_type: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    attorney_id: DataTypes.INTEGER,
    estimated_revenue:DataTypes.STRING,
    target_status:DataTypes.INTEGER,
    revenue_start_month:DataTypes.STRING,
    revenue_end_month:DataTypes.STRING,
    estimated_lifetime_value:DataTypes.STRING,
    close_date:DataTypes.STRING,
    targetEndDate:DataTypes.STRING

  }, {});
  target.associate = function(models) {
    // associations can be defined here
  };
  return target;
};
