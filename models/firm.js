'use strict';
module.exports = (sequelize, DataTypes) => {
  var firm = sequelize.define('firm', {
    title: DataTypes.STRING,
    address: DataTypes.TEXT,
    address1: DataTypes.TEXT,
    address2: DataTypes.TEXT,
    phone_no: DataTypes.STRING,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    fax: DataTypes.STRING,
    mobile: DataTypes.STRING,
    website_url: DataTypes.STRING,
    social_url: DataTypes.STRING,
    firm_code: DataTypes.STRING,
    firm_registration: DataTypes.STRING
  }, {});
  firm.associate = function(models) {
    // associations can be defined here
  };
  return firm;
};