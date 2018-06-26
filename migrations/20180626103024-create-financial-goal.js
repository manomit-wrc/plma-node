'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('financial_goals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firm_id: {
        type: Sequelize.INTEGER
      },
      attorney_id: {
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.STRING
      },
      year_goal: {
        type: Sequelize.STRING
      },
      year_goal_percentage: {
        type: Sequelize.STRING
      },
      summary: {
        type: Sequelize.TEXT
      },
      remarks: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('financial_goals');
  }
};