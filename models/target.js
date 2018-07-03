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
    address_1: DataTypes.STRING,
    address_2: DataTypes.STRING,
    firm_id: DataTypes.STRING,
    designation_id: DataTypes.STRING,
    fax: DataTypes.STRING,
    twitter: DataTypes.STRING,
    youtube: DataTypes.STRING,
    im: DataTypes.STRING,

    facebook: DataTypes.STRING,
    google: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
    gender: DataTypes.STRING,
    linked_in: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    social_sequrity_no: DataTypes.STRING,
    status: DataTypes.STRING,
    target_code: DataTypes.STRING,
    target_id: DataTypes.STRING,
    target_code: DataTypes.STRING,
    youtube: DataTypes.STRING,
    remarks: DataTypes.STRING,
    website_url: DataTypes.STRING,
    social_url: DataTypes.STRING,
    status: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    organization_code: DataTypes.STRING,
    organization_id: DataTypes.STRING,
    address3: DataTypes.STRING,
    industry_type: DataTypes.STRING,
    company_name: DataTypes.STRING,
    association: DataTypes.STRING,
    target_type: DataTypes.STRING
  }, {});
  target.associate = function(models) {
    // associations can be defined here
  };
  return target;
};
