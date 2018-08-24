'use strict';
module.exports = (sequelize, DataTypes) => {
  var request_approval = sequelize.define('request_approval', {
    activity_id: DataTypes.INTEGER,
    approver_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    approver_status: DataTypes.STRING,
    approve: DataTypes.STRING
  }, {});
  request_approval.associate = function(models) {
    // associations can be defined here
  };
  return request_approval;
};