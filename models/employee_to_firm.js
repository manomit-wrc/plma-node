'use strict';
module.exports = (sequelize, DataTypes) => {
  var employee_to_firm = sequelize.define('employee_to_firm', {
    user_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER
  }, {
    timestamps: false
  });
  employee_to_firm.associate = function(models) {
    // associations can be defined here
  };
  return employee_to_firm;
};