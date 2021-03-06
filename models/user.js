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
    role_id: DataTypes.INTEGER,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    dob: DataTypes.DATE,
    firm_id: DataTypes.INTEGER,
    actual_role_id: DataTypes.INTEGER,
    is_attorney: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER,
    designation_id: DataTypes.INTEGER,
    section_id: DataTypes.INTEGER,
    new_user_status: DataTypes.INTEGER,

    approver: DataTypes.INTEGER
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};
