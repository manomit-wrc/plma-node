'use strict';
module.exports = (sequelize, DataTypes) => {
  var target = sequelize.define('target', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
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
    type: DataTypes.STRING,
    company_name: DataTypes.STRING,
    fax: DataTypes.STRING,
    twitter: DataTypes.STRING,
    facebook: DataTypes.STRING,
    google: DataTypes.STRING,
    association: DataTypes.STRING,
    industry_type: DataTypes.STRING
  }, {});
  target.associate = function(models) {
    // associations can be defined here
  };
  return target;
};