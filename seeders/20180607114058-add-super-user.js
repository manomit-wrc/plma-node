'use strict';
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
module.exports = {
  up: (queryInterface, Sequelize) => {
    const avatar = gravatar.url("admin@wrctpl.com", {
      s: '150',
      r: 'pg',
      d: 'mm'
    });
    return queryInterface.bulkInsert('users', [{
      first_name: "Jane",
      last_name: "Doe",
      email: "admin@wrctpl.com",
      password: bCrypt.hashSync("Parth0Sen"),
      mobile_no: "9988774466",
      avatar,
      address: 'Saltlake, Sector V, Kolkata',
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
   //return queryInterface.bulkDelete('users', null, {});
  }
};
