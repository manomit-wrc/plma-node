'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'users',
        'dob',
        {
          type: Sequelize.DATE,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'users',
        'gender',
        {
          type: Sequelize.STRING(1),
          allowNull: true
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    
  }
};
