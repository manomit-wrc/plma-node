'use strict';
module.exports = (sequelize, DataTypes) => {
  var contact_information = sequelize.define('contact_information', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    gender: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    fax: DataTypes.STRING,
    type: DataTypes.STRING,
    contact_id: DataTypes.INTEGER
  }, {});
  contact_information.associate = function(models) {
    // associations can be defined here
  };
  return contact_information;
};