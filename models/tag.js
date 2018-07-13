'use strict';
module.exports = (sequelize, DataTypes) => {
  var tag = sequelize.define('tag', {
    client_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    tags: DataTypes.STRING
  }, {});
  tag.associate = function(models) {
    // associations can be defined here
  };
  return tag;
};