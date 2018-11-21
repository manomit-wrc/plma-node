'use strict';
module.exports = (sequelize, DataTypes) => {
  var strategic_goal_to_activity_goal = sequelize.define('strategic_goal_to_activity_goal', {
    activity_goal_id: DataTypes.INTEGER,
    strategic_goal_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  strategic_goal_to_activity_goal.associate = function(models) {
    // associations can be defined here
  };
  return strategic_goal_to_activity_goal;
};