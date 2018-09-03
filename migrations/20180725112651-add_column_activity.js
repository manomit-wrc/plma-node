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
        'activities',
        'firm_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'activities',
        'practice_area', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'activities',
        'remarks', {
          type: Sequelize.TEXT,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'activities',
        'section_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
           defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'activities',
        's_group_id', {
          type: Sequelize.String,
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
