'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'targets',
        'phone_no',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'targets',
        'date_of_birth',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'targets',
        'gender',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'targets',
        'linked_in',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'targets',
        'youtube',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),

    ];

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
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
