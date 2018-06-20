'use strict';
module.exports = (sequelize, DataTypes) => {
  var state = sequelize.define('state', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    country_id: DataTypes.STRING
  }, {});
  state.associate = function(models) {
    // associations can be defined here
  };
  return state;
};