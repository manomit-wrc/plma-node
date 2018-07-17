'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('attorney_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      group: {
        type: Sequelize.STRING
      },
      section: {
        type: Sequelize.STRING
      },
      designation: {
        type: Sequelize.STRING
      },
      attorney_id: {
        type: Sequelize.INTEGER
      },
      attorney_code: {
        type: Sequelize.STRING
      },
      attorney_type: {
        type: Sequelize.STRING
      },
      education: {
        type: Sequelize.STRING
      },
      bar_registration: {
        type: Sequelize.STRING
      },
      job_type: {
        type: Sequelize.STRING
      },
      bar_practice_date: {
        type: Sequelize.DATE
      },
      firm_join_date: {
        type: Sequelize.DATE
      },
      jurisdiction: {
        type: Sequelize.STRING
      },
      industry_type: {
        type: Sequelize.STRING
      },
      hourly_cost: {
        type: Sequelize.STRING
      },
      benefit_factor: {
        type: Sequelize.STRING
      },
      overhead_amount: {
        type: Sequelize.STRING
      },
      billing_opp_cost: {
        type: Sequelize.STRING
      },
      address2: {
        type: Sequelize.STRING
      },
      address3: {
        type: Sequelize.STRING
      },
      phone_no: {
        type: Sequelize.STRING
      },
      e_mail: {
        type: Sequelize.STRING
      },
      fax: {
        type: Sequelize.STRING
      },
      website_url: {
        type: Sequelize.STRING
      },
      social_url: {
        type: Sequelize.STRING
      },
      remarks: {
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
    return queryInterface.dropTable('attorney_details');
  }
};