'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firm: {
        type: Sequelize.STRING
      },
      activity_type: {
        type: Sequelize.STRING
      },
      activity_goal: {
        type: Sequelize.STRING
      },
      practice_area: {
        type: Sequelize.STRING
      },
      potiential_revenue: {
        type: Sequelize.STRING
      },
      remarks: {
        type: Sequelize.STRING
      },
      creation_date: {
        type: Sequelize.STRING
      },
      from_date: {
        type: Sequelize.STRING
      },
      to_date: {
        type: Sequelize.STRING
      },
      activity_name: {
        type: Sequelize.STRING
      },
      activity_reason: {
        type: Sequelize.STRING
      },
      budget_status: {
        type: Sequelize.STRING
      },
      budget_details_status: {
        type: Sequelize.STRING
      },
      target: {
        type: Sequelize.STRING
      },
      clint: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      attachment_field: {
        type: Sequelize.STRING
      },
      activity_update: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('activities');
  }
};