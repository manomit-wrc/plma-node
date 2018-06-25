'use strict';
module.exports = (sequelize, DataTypes) => {
  var section_to_firms = sequelize.define('section_to_firms', {
    firm_id: DataTypes.INTEGER,
    section_id: DataTypes.INTEGER
  }, {});
  section_to_firms.associate = function(models) {
    // associations can be defined here
  };
  return section_to_firms;
};