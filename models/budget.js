'use strict';
module.exports = (sequelize, DataTypes) => {
  var budget = sequelize.define('budget', {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
    remarks: DataTypes.TEXT
  }, {});
  budget.associate = function(models) {
    budget.belongsTo(models.budget, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'parent_id',
        allowNull: true
      },
      as: 'BudgetHead'
    });
  };
  return budget;
};