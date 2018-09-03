'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return [
      queryInterface.addColumn(
        'targets',
        'target_id',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
        queryInterface.addColumn(
          'targets',
          'target_code',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
        ),
          queryInterface.addColumn(
            'targets',
            'status',
            {
              type: Sequelize.STRING,
              allowNull: true
            }
          ),
            queryInterface.addColumn(
              'targets',
              'social_sequrity_no',
              {
                type: Sequelize.STRING,
                allowNull: true
              }
            ),
              queryInterface.addColumn(
                'targets',
                'im',
                {
                  type: Sequelize.STRING,
                  allowNull: true
                }
              ),
                queryInterface.addColumn(
                  'targets',
                  'remarks',
                  {
                    type: Sequelize.STRING,
                    allowNull: true
                  }
                ),
                  queryInterface.addColumn(
                    'targets',
                    'website_url',
                    {
                      type: Sequelize.STRING,
                      allowNull: true
                    }
                  ),
                    queryInterface.addColumn(
                      'targets',
                      'social_url',
                      {
                        type: Sequelize.STRING,
                        allowNull: true
                      }
                    ),
                      queryInterface.addColumn(
                        'targets',
                        'address3',
                        {
                          type: Sequelize.STRING,
                          allowNull: true
                        }
                      ),
                        queryInterface.addColumn(
                          'targets',
                          'address_remarks',
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
