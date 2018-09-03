'use strict';
module.exports = (sequelize, DataTypes) => {
  var practice_area_to_attorney = sequelize.define('practice_area_to_attorney', {
    attorney_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    practice_area_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  practice_area_to_attorney.associate = function(models) {
    // associations can be defined here
  };
  return practice_area_to_attorney;
};