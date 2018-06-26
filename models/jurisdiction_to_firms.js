'use strict';
module.exports = (sequelize, DataTypes) => {
  var jurisdiction_to_firms = sequelize.define('jurisdiction_to_firms', {
    firm_id: DataTypes.INTEGER,
    jurisdiction_id: DataTypes.INTEGER
  }, {});
  jurisdiction_to_firms.associate = function(models) {
    // associations can be defined here
  };
  return jurisdiction_to_firms;
};