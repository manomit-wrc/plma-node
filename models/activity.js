'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity = sequelize.define('activity', {
    firm_id: DataTypes.INTEGER,
    activity_type: DataTypes.STRING,
    activity_goal_id: DataTypes.INTEGER,
    practice_area: DataTypes.INTEGER,
    potiential_revenue: DataTypes.STRING,
    remarks: DataTypes.TEXT,
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
    section_id: DataTypes.INTEGER,
    s_group_id: DataTypes.STRING

  }, {});
  activity.associate = function(models) {
    // associations can be defined here
  };
  return activity;
};
