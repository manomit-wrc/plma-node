'use strict';
module.exports = (sequelize, DataTypes) => {
  var practicearea = sequelize.define('practicearea', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  practicearea.associate = function(models) {
    // associations can be defined here
  };
  return practicearea;
};