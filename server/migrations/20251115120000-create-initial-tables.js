"use strict";

/**
 * Create initial tables: Users, Categories, Tags, Quizzes, Questions, QuizTags, Attempts
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.ENUM('attempter','contributor','admin'), allowNull: false, defaultValue: 'attempter' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Categories
    await queryInterface.createTable('Categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Tags
    await queryInterface.createTable('Tags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Quizzes
    await queryInterface.createTable('Quizzes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      totalTimeMinutes: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      questionsCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      contributorId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      categoryId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Categories', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Questions
    await queryInterface.createTable('Questions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.STRING, allowNull: false },
      stem: { type: Sequelize.TEXT, allowNull: false },
      data: { type: Sequelize.JSON, allowNull: true },
      position: { type: Sequelize.INTEGER, allowNull: true },
      quizId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Quizzes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // QuizTags (join table)
    await queryInterface.createTable('QuizTags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      quizId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Quizzes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      tagId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Tags', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Attempts
    await queryInterface.createTable('Attempts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      score: { type: Sequelize.FLOAT, allowNull: true },
      startedAt: { type: Sequelize.DATE, allowNull: true },
      finishedAt: { type: Sequelize.DATE, allowNull: true },
      answers: { type: Sequelize.JSON, allowNull: true },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      quizId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Quizzes', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attempts');
    await queryInterface.dropTable('QuizTags');
    await queryInterface.dropTable('Questions');
    await queryInterface.dropTable('Quizzes');
    await queryInterface.dropTable('Tags');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
};
