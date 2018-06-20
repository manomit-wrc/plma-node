'use strict';
module.exports = (sequelize, DataTypes) => {
  var city = sequelize.define('city', {
    name: DataTypes.STRING,
    state_id: DataTypes.STRING
  }, {});
  city.associate = function(models) {
    // associations can be defined here
  };
  return city;
};