'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'users',
        'is_attorney', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'users',
        'group_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'users',
        'designation_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
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
