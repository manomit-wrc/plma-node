'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity = sequelize.define('activity', {
    firm: DataTypes.STRING,
    activity_type: DataTypes.STRING,
    activity_goal_id: DataTypes.INTEGER,
    practice_area: DataTypes.STRING,
    potiential_revenue: DataTypes.STRING,
    remarks: DataTypes.STRING,
    activity_creation_date: DataTypes.DATE,
    activity_from_date: DataTypes.DATE,
    activity_to_date: DataTypes.DATE,
    activity_name: DataTypes.STRING,
    activity_reason: DataTypes.STRING,
    budget_status: DataTypes.STRING,
    budget_details_status: DataTypes.STRING,
    target: DataTypes.STRING,
    total_budget_hour: DataTypes.STRING,
    total_budget_amount: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    clint: DataTypes.STRING
  }, {});
  activity.associate = function(models) {
    // associations can be defined here
  };
  return activity;
};
