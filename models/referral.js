'use strict';
module.exports = (sequelize, DataTypes) => {
  var referral = sequelize.define('referral', {
    referral_type: DataTypes.STRING,
    attorney_id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    organization_name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    referred_type: DataTypes.STRING,
    target_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  referral.associate = function(models) {
    // associations can be defined here
  };
  return referral;
};