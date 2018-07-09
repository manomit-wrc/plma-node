'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('referrals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referral_type: {
        type: Sequelize.STRING
      },
      attorney_id: {
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      organization_name: {
        type: Sequelize.STRING
      },
      referred_type: {
        type: Sequelize.STRING
      },
      referred_id: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('referrals');
  }
};