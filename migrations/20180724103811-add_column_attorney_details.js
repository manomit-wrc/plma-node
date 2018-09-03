'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return [
      queryInterface.addColumn(
        'attorney_details',
        'group', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'attorney_details',
        'section', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'attorney_details',
        'designation', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'attorney_details',
        'firm_id', {
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
