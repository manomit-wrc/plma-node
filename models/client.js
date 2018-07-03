'use strict';
module.exports = (sequelize, DataTypes) => {
  var client = sequelize.define('client', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    pin_code: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    address_line_3: DataTypes.STRING,
    firm_id: DataTypes.STRING,
    designation_id: DataTypes.STRING,
    type: DataTypes.STRING,
    company_name: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkdn: DataTypes.STRING,
    facebook: DataTypes.STRING,
    google: DataTypes.STRING,
    association_type: DataTypes.STRING,
    industry_type: DataTypes.STRING,
    fax: DataTypes.STRING,
    IM: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
    gender: DataTypes.STRING,
    client_id: DataTypes.STRING,
    master_id: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    organization_id: DataTypes.STRING,
    organization_code: DataTypes.STRING,
    remarks: DataTypes.STRING,
    client_type: DataTypes.STRING,
    client_company: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    social_security_no: DataTypes.STRING
  }, {});
  client.associate = function(models) {
    // associations can be defined here
  };
  return client;
};