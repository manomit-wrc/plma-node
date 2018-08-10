'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'referrals',
        'gender', {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'estimated_revenue', {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'address1', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'address2', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'address3', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'country', {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'referrals',
          'state', {
            type: Sequelize.INTEGER,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'city', {
            type: Sequelize.INTEGER,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'zipcode', {
            type: Sequelize.INTEGER,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'address_remarks', {
            type: Sequelize.TEXT,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'company_name', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'website_url', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'fax', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'phone_no', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'im', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'twitter', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'linkedin', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'social_url', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'google', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'youtube', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'association', {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'referrals',
          'industry_type', {
            type: Sequelize.INTEGER,
            allowNull: true
          }
        ),
      ];
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
