'use strict';
module.exports = (sequelize, DataTypes) => {
  var referred_client_target = sequelize.define('referred_client_target', {
    type: DataTypes.STRING,
    target_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    referral_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  referred_client_target.associate = function(models) {
    // associations can be defined here
  };
  return referred_client_target;
};