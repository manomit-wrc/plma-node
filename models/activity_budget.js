'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity_budget = sequelize.define('activity_budget', {
    activity_id: DataTypes.INTEGER,
    level_type: DataTypes.STRING,
    budget_id: DataTypes.INTEGER,
    hour: DataTypes.REAL,
    amount: DataTypes.REAL,
    status: DataTypes.INTEGER,
    activity_goal_id: DataTypes.INTEGER,
    approver_remarks: DataTypes.TEXT
    
  }, {});
  activity_budget.associate = function(models) {
    // associations can be defined here
  };
  return activity_budget;
};