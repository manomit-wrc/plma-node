'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "id"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'role_id');
  }
};
