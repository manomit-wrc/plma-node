'use strict';
module.exports = (sequelize, DataTypes) => {
  var office = sequelize.define('office', {
    firm_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    country: DataTypes.INTEGER,
    zipcode: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  office.associate = function(models) {
    // associations can be defined here
  };
  return office;
};