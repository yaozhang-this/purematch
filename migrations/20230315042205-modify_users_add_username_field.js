"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        "Users", // table name
        "username", // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        }
      ),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([queryInterface.removeColumn("Users", "username")]);
  },
};
