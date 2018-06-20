'use strict';
module.exports = (sequelize, DataTypes) => {
  var industry_type = sequelize.define('industry_type', {
    code: DataTypes.STRING,
    industry_name: DataTypes.STRING,
    remarks: DataTypes.STRING
  }, {});
  industry_type.associate = function(models) {
    // associations can be defined here
  };
  return industry_type;
};