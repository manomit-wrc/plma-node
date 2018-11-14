'use strict';
module.exports = (sequelize, DataTypes) => {
  var practice_area_to_activity = sequelize.define('practice_area_to_activity', {
    activity_id: DataTypes.INTEGER,
    practice_area_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  practice_area_to_activity.associate = function(models) {
    // associations can be defined here
  };
  return practice_area_to_activity;
};