'use strict';
module.exports = (sequelize, DataTypes) => {
  var jointactivity = sequelize.define('jointactivity', {
    activity_id: DataTypes.STRING,
    target_client_type: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  jointactivity.associate = function(models) {
    // associations can be defined here
  };
  return jointactivity;
};