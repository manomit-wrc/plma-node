'use strict';
module.exports = (sequelize, DataTypes) => {
  var country = sequelize.define('country', {
    code: DataTypes.STRING
  }, {});
  country.associate = function(models) {
    // associations can be defined here
  };
  return country;
};