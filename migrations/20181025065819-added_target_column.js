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
      'targets',
      'life_time_revenue', {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    ),
    queryInterface.addColumn(
      'targets',
      'targetCloseDate', {
        type: Sequelize.DATE,
        allowNull: true
      }
    ),
    queryInterface.addColumn(
      'targets',
      'targetStartDate', {
        type: Sequelize.DATE,
        allowNull: true
      }
    ),
    queryInterface.addColumn(
      'targets',
      'planning_period', {
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
