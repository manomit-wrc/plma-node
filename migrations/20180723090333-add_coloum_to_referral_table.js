'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'referrals',
        'firm_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'referrals',
        'user_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
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
