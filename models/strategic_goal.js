'use strict';
module.exports = (sequelize, DataTypes) => {
  var strategic_goal = sequelize.define('strategic_goal', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    firm_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  strategic_goal.associate = function(models) {
    // associations can be defined here
  };
  return strategic_goal;
};