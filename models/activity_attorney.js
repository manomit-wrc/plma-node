'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity_attorney = sequelize.define('activity_attorney', {
    attorney_id: DataTypes.INTEGER,
    activity_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {});
  activity_attorney.associate = function(models) {
    // associations can be defined here
  };
  return activity_attorney;
};