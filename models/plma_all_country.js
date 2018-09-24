'use strict';
module.exports = (sequelize, DataTypes) => {
  var plma_all_country = sequelize.define('plma_all_country', {
    parent_id: DataTypes.INTEGER,
    zip: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    full_state: DataTypes.STRING,
    price: DataTypes.STRING,
    vendor_price: DataTypes.STRING
  }, {});
  plma_all_country.associate = function(models) {
    // associations can be defined here
  };
  return plma_all_country;
};