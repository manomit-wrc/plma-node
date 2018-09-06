'use strict';
module.exports = (sequelize, DataTypes) => {
  var revenue = sequelize.define('revenue', {
    type: DataTypes.STRING,
    target_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    planning_period: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    estimated_revenue: DataTypes.STRING,
    current_revenue: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  revenue.associate = function(models) {
    // associations can be defined here
  };
  return revenue;
};