'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity_goal = sequelize.define('activity_goal', {
    firm_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    activity_goal: DataTypes.TEXT,
    from_date: DataTypes.DATE,
    to_date: DataTypes.DATE,
    remarks: DataTypes.TEXT,
    category: DataTypes.STRING,
    strategic_goal_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  activity_goal.associate = function(models) {
    // associations can be defined here
  };
  return activity_goal;
};