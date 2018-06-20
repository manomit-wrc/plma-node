'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    mobile_no: DataTypes.STRING,
    avatar: DataTypes.STRING,
    address: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    dob: DataTypes.DATE,
    firm_id: DataTypes.INTEGER,
    date_of_birth: DataTypes.STRING
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};