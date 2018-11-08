'use strict';
module.exports = (sequelize, DataTypes) => {
  const notificationTable = sequelize.define('notificationTable', {
    notification_details: DataTypes.STRING,
    approve_id: DataTypes.INTEGER,
    activity_type_id: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    activity_id: DataTypes.INTEGER,

    status: DataTypes.INTEGER
  }, {});
  notificationTable.associate = function(models) {
    // associations can be defined here
  };
  return notificationTable;
};