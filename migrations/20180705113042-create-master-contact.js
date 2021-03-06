'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('master_contacts', {
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
      phone_no: {
        type: Sequelize.STRING
      },
      master_contact_id: {
        type: Sequelize.INTEGER
      },
      fax: {
        type: Sequelize.STRING
      },
      master_contact_code: {
        type: Sequelize.STRING
      },
      mobile_no: {
        type: Sequelize.STRING
      },
      website_url: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      address1: {
        type: Sequelize.STRING
      },
      address2: {
        type: Sequelize.STRING
      },
      address3: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      industry_type: {
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
      zip_code: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      },
      twitter: {
        type: Sequelize.STRING
      },
      linkedin: {
        type: Sequelize.STRING
      },
      google: {
        type: Sequelize.STRING
      },
      youtube: {
        type: Sequelize.STRING
      },
      im: {
        type: Sequelize.STRING
      },
      address_remarks: {
        type: Sequelize.TEXT
      },
      remarks: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      attorney_id: {
        type: Sequelize.INTEGET
      },
      facebook: {
        type: Sequelize.STRING
      },
      master_contact_id: {
        type: Sequelize.STRING
      },
      estimated_revenue: {
        type: Sequelize.STRING
      },
      organization_name: {
        type: Sequelize.STRING
      },
      organization_code: {
        type: Sequelize.STRING
      },
      revenueclosingDate: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('master_contacts');
  }
};