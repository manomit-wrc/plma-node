'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity_attroney = sequelize.define('activity_attroney', {
    attorney_id: DataTypes.INTEGER,
    activity_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {});
  activity_attroney.associate = function(models) {
    // associations can be defined here
  };
  return activity_attroney;
};