'use strict';
module.exports = (sequelize, DataTypes) => {
  var budget = sequelize.define('budget', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT
  }, {});
  budget.associate = function(models) {
    // associations can be defined here
  };
  return budget;
};