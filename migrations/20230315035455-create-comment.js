"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      post_id: {
        allowNull: false,
        references: {
          model: {
            tableName: "Posts",
          },
          key: "id",
        },
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
      },
      commenter_id: {
        allowNull: false,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Comments");
  },
};
