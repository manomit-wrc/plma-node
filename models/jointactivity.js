'use strict';
module.exports = (sequelize, DataTypes) => {
  var jointactivity = sequelize.define('jointactivity', {
    activity_id: DataTypes.STRING,
    target_client_type: DataTypes.STRING,
    type: DataTypes.STRING,
    attorney_id: DataTypes.INTEGER
  }, {});
  jointactivity.associate = function(models) {
    // associations can be defined here
  };
  return jointactivity;
};