'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('targets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mobile_no: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      postal_code: {
        type: Sequelize.STRING
      },
      address_1: {
        type: Sequelize.STRING
      },
      address_2: {
        type: Sequelize.STRING
      },
      firm_id: {
        type: Sequelize.STRING
      },
      designation_id: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      },
      fax: {
        type: Sequelize.STRING
      },
      twitter: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      google: {
        type: Sequelize.STRING
      },
      association: {
        type: Sequelize.STRING
      },
      industry_type: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('targets');
  }
};