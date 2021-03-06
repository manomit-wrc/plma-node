'use strict';
module.exports = (sequelize, DataTypes) => {
  var office_contact = sequelize.define('office_contact', {
    office_id: DataTypes.INTEGER,
    designation_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  office_contact.associate = function(models) {
    // associations can be defined here
  };
  return office_contact;
};