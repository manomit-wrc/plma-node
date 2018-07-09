'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity = sequelize.define('activity', {
    firm: DataTypes.STRING,
    activity_type: DataTypes.STRING,
    activity_goal: DataTypes.STRING,
    practice_area: DataTypes.STRING,
    potiential_revenue: DataTypes.STRING,
    remarks: DataTypes.STRING,
    creation_date: DataTypes.STRING,
    from_date: DataTypes.STRING,
    to_date: DataTypes.STRING,
    activity_name: DataTypes.STRING,
    activity_reason: DataTypes.STRING,
    budget_status: DataTypes.STRING,
    budget_details_status: DataTypes.STRING,
    target: DataTypes.STRING,
    clint: DataTypes.STRING
  }, {});
  activity.associate = function(models) {
    // associations can be defined here
  };
  return activity;
};