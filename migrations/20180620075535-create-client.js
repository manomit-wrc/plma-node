'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('clients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
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
      pin_code: {
        type: Sequelize.STRING
      },
      address1: {
        type: Sequelize.STRING
      },
      address2: {
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
      twitter: {
        type: Sequelize.STRING
      },
      linkdn: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      google: {
        type: Sequelize.STRING
      },
      association_type: {
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
      },
      current_revenue: {
         type: Sequelize.STRING
      },
      estimated_revenue: {
         type: Sequelize.STRING
      },
      revenueclosingDate: {
         type: Sequelize.STRING
      },
      clientStartDate: {
         type: Sequelize.STRING
      },
      clientEndDate: {
         type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('clients');
  }
};