'use strict';
module.exports = (sequelize, DataTypes) => {
  var setting = sequelize.define('setting', {
    company_name: DataTypes.STRING,
    address: DataTypes.STRING,
    contact_person: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    fax: DataTypes.STRING,
    website_url: DataTypes.STRING
  }, {});
  setting.associate = function(models) {
    // associations can be defined here
  };
  return setting;
};