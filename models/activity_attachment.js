'use strict';
module.exports = (sequelize, DataTypes) => {
  var activity_attachment = sequelize.define('activity_attachment', {
    activity_id: DataTypes.INTEGER,
    attachment: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  activity_attachment.associate = function(models) {
    // associations can be defined here
  };
  return activity_attachment;
};