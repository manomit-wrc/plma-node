'use strict';
module.exports = (sequelize, DataTypes) => {
  var zipcode = sequelize.define('zipcode', {
    zip: DataTypes.STRING,
    city_name: DataTypes.STRING,
    lat: DataTypes.STRING,
    lng: DataTypes.STRING
  }, {});
  zipcode.associate = function(models) {
    // associations can be defined here
  };
  return zipcode;
};