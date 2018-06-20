'use strict';
module.exports = (sequelize, DataTypes) => {
  var group = sequelize.define('group', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  group.associate = function(models) {
    // associations can be defined here
  };
  return group;
};