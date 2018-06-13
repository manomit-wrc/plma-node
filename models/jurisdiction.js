'use strict';
module.exports = (sequelize, DataTypes) => {
  var jurisdiction = sequelize.define('jurisdiction', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  jurisdiction.associate = function(models) {
    // associations can be defined here
  };
  return jurisdiction;
};