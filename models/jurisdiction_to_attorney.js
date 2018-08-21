'use strict';
module.exports = (sequelize, DataTypes) => {
  var jurisdiction_to_attorney = sequelize.define('jurisdiction_to_attorney', {
    attorney_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    jurisdiction_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  jurisdiction_to_attorney.associate = function(models) {
    // associations can be defined here
  };
  return jurisdiction_to_attorney;
};