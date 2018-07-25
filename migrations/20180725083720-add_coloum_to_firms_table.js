'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'firms',
        'approval_level', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'firms',
        'level_1', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'firms',
        'level_2', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'firms',
        'level_3', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      ),
      queryInterface.addColumn(
        'firms',
        'level_4', {
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
