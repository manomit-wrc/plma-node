'use strict';
module.exports = (sequelize, DataTypes) => {
  var practice_area_to_firms = sequelize.define('practice_area_to_firms', {
    firm_id: DataTypes.INTEGER,
    practice_area_id: DataTypes.INTEGER
  }, {});
  practice_area_to_firms.associate = function(models) {
    // associations can be defined here
  };
  return practice_area_to_firms;
};