'use strict';
module.exports = (sequelize, DataTypes) => {
  var firm = sequelize.define('firm', {
    title: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {});
  firm.associate = function(models) {
    // associations can be defined here
  };
  return firm;
};