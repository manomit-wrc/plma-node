'use strict';
module.exports = (sequelize, DataTypes) => {
  var financial_goal = sequelize.define('financial_goal', {
    firm_id: DataTypes.INTEGER,
    attorney_id: DataTypes.INTEGER,
    year: DataTypes.STRING,
    year_goal: DataTypes.STRING,
    year_goal_percentage: DataTypes.STRING,
    summary: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  financial_goal.associate = function(models) {
    // associations can be defined here
  };
  return financial_goal;
};