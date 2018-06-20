'use strict';
module.exports = (sequelize, DataTypes) => {
  var office = sequelize.define('office', {
    firm_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  office.associate = function(models) {
    // associations can be defined here
  };
  return office;
};