'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          username: 'superuser',
          email: 'superuser@gmail.com',
          fullname: 'superuser',
          password: 'superuser',
          picture: 'default.png',
          bio: 'superuser bio',
          createdBy: 0,
          createdAt: new Date(),
          updatedBy: 0,
          updatedAt: new Date(),
          isDeleted: false,
        },
        {
          username: 'admin',
          email: 'admin@gmail.com',
          fullname: 'admin',
          password: 'admin',
          picture: 'default.png',
          bio: 'admin bio',
          createdBy: 0,
          createdAt: new Date(),
          updatedBy: 0,
          updatedAt: new Date(),
          isDeleted: false,
        },
        {
          username: 'tester',
          email: 'tester@gmail.com',
          fullname: 'tester',
          password: 'tester',
          picture: 'default.png',
          bio: 'tester bio',
          createdBy: 0,
          createdAt: new Date(),
          updatedBy: 0,
          updatedAt: new Date(),
          isDeleted: false,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     */

    await queryInterface.bulkDelete('People', null, {});
  },
};
