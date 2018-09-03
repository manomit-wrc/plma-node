'use strict';
module.exports = (sequelize, DataTypes) => {
  var section = sequelize.define('section', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  section.associate = function(models) {
    // associations can be defined here
  };
  return section;
};