'use strict';
module.exports = (sequelize, DataTypes) => {
  var designation = sequelize.define('designation', {
    code: DataTypes.STRING,
    title: DataTypes.STRING,
    remarks: DataTypes.STRING
  }, {});
  designation.associate = function(models) {
    // associations can be defined here
  };
  return designation;
};