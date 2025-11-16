"use strict";

/**
 * Seed initial categories, users, tags, quizzes, questions and quiz-tags
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Insert categories/users/tags without explicit IDs to avoid conflicts on re-seed
    try {
      await queryInterface.bulkInsert('Categories', [
        { name: 'General Knowledge', slug: 'general-knowledge', createdAt: now, updatedAt: now },
        { name: 'Mathematics', slug: 'mathematics', createdAt: now, updatedAt: now },
        { name: 'Science', slug: 'science', createdAt: now, updatedAt: now }
      ], {});
    } catch (e) { /* ignore unique constraint if already seeded */ }

    try {
      await queryInterface.bulkInsert('Users', [
        { username: 'alice_contrib', email: 'alice@example.com', passwordHash: null, role: 'contributor', createdAt: now, updatedAt: now },
        { username: 'bob_admin', email: 'bob@example.com', passwordHash: null, role: 'admin', createdAt: now, updatedAt: now }
      ], {});
    } catch (e) { }

    try {
      await queryInterface.bulkInsert('Tags', [
        { name: 'trivia', createdAt: now, updatedAt: now },
        { name: 'algebra', createdAt: now, updatedAt: now },
        { name: 'physics', createdAt: now, updatedAt: now }
      ], {});
    } catch (e) { }

    // Look up inserted IDs
    const [[{ id: genCatId }]] = await queryInterface.sequelize.query("SELECT id FROM Categories WHERE slug = 'general-knowledge' LIMIT 1;");
    const [[{ id: mathCatId }]] = await queryInterface.sequelize.query("SELECT id FROM Categories WHERE slug = 'mathematics' LIMIT 1;");
    const [[{ id: sciCatId }]] = await queryInterface.sequelize.query("SELECT id FROM Categories WHERE slug = 'science' LIMIT 1;");

    const [[{ id: aliceId }]] = await queryInterface.sequelize.query("SELECT id FROM Users WHERE username = 'alice_contrib' LIMIT 1;");

    const [[{ id: triviaTagId }]] = await queryInterface.sequelize.query("SELECT id FROM Tags WHERE name = 'trivia' LIMIT 1;");
    const [[{ id: algebraTagId }]] = await queryInterface.sequelize.query("SELECT id FROM Tags WHERE name = 'algebra' LIMIT 1;");
    const [[{ id: physicsTagId }]] = await queryInterface.sequelize.query("SELECT id FROM Tags WHERE name = 'physics' LIMIT 1;");

    // Insert quizzes (ignore unique failures) and capture their generated IDs by selecting them after insert
    try {
      await queryInterface.bulkInsert('Quizzes', [
        { title: 'World Trivia: Quick 5', description: 'A short collection of general knowledge questions.', totalTimeMinutes: 5, questionsCount: 5, contributorId: aliceId, categoryId: genCatId, createdAt: now, updatedAt: now },
        { title: 'Basic Algebra Warmup', description: 'Practice simple algebra problems.', totalTimeMinutes: 10, questionsCount: 4, contributorId: aliceId, categoryId: mathCatId, createdAt: now, updatedAt: now },
        { title: 'Intro Physics', description: 'Fundamental physics multiple choice.', totalTimeMinutes: 15, questionsCount: 4, contributorId: aliceId, categoryId: sciCatId, createdAt: now, updatedAt: now }
      ], {});
    } catch (e) { }

    const [[{ id: quiz1Id }]] = await queryInterface.sequelize.query("SELECT id FROM Quizzes WHERE title = 'World Trivia: Quick 5' LIMIT 1;");
    const [[{ id: quiz2Id }]] = await queryInterface.sequelize.query("SELECT id FROM Quizzes WHERE title = 'Basic Algebra Warmup' LIMIT 1;");
    const [[{ id: quiz3Id }]] = await queryInterface.sequelize.query("SELECT id FROM Quizzes WHERE title = 'Intro Physics' LIMIT 1;");

    // Questions
    await queryInterface.bulkInsert('Questions', [
      { type: 'mcq', stem: 'Which is the largest continent by land area?', data: JSON.stringify({ options: ['Africa','Asia','North America','Antarctica'], correctIndex: 1 }), position: 1, quizId: quiz1Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Which ocean is the Bahamas located in?', data: JSON.stringify({ options: ['Pacific','Atlantic','Indian','Arctic'], correctIndex: 1 }), position: 2, quizId: quiz1Id, createdAt: now, updatedAt: now },
      { type: 'short', stem: 'What is the capital city of Japan?', data: JSON.stringify({ answer: 'Tokyo' }), position: 3, quizId: quiz1Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Which language has the most native speakers?', data: JSON.stringify({ options: ['English','Mandarin Chinese','Spanish','Hindi'], correctIndex: 1 }), position: 4, quizId: quiz1Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Which country hosted the 2016 Summer Olympics?', data: JSON.stringify({ options: ['China','UK','Brazil','Russia'], correctIndex: 2 }), position: 5, quizId: quiz1Id, createdAt: now, updatedAt: now },

      { type: 'mcq', stem: 'Solve for x: 2x + 3 = 11', data: JSON.stringify({ options: ['3','4','5','6'], correctIndex: 1 }), position: 1, quizId: quiz2Id, createdAt: now, updatedAt: now },
      { type: 'short', stem: 'What is the value of x if x^2 = 25 and x > 0?', data: JSON.stringify({ answer: '5' }), position: 2, quizId: quiz2Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Simplify: 3(x + 2) - x', data: JSON.stringify({ options: ['2x+6','2x+2','3x+2','x+6'], correctIndex: 3 }), position: 3, quizId: quiz2Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'What is the slope of the line y = 4x + 1?', data: JSON.stringify({ options: ['1','2','3','4'], correctIndex: 3 }), position: 4, quizId: quiz2Id, createdAt: now, updatedAt: now },

      { type: 'mcq', stem: 'What force keeps planets in orbit around the sun?', data: JSON.stringify({ options: ['Magnetic','Friction','Gravity','Strong force'], correctIndex: 2 }), position: 1, quizId: quiz3Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Unit of electrical resistance?', data: JSON.stringify({ options: ['Ohm','Watt','Volt','Ampere'], correctIndex: 0 }), position: 2, quizId: quiz3Id, createdAt: now, updatedAt: now },
      { type: 'short', stem: 'What is the acceleration due to gravity on Earth (approx m/s^2)?', data: JSON.stringify({ answer: '9.8' }), position: 3, quizId: quiz3Id, createdAt: now, updatedAt: now },
      { type: 'mcq', stem: 'Which particle carries a negative charge?', data: JSON.stringify({ options: ['Proton','Electron','Neutron','Photon'], correctIndex: 1 }), position: 4, quizId: quiz3Id, createdAt: now, updatedAt: now }
    ], {});

    // QuizTags (link quizzes and tags)
    await queryInterface.bulkInsert('QuizTags', [
      { quizId: quiz1Id, tagId: triviaTagId, createdAt: now, updatedAt: now },
      { quizId: quiz2Id, tagId: algebraTagId, createdAt: now, updatedAt: now },
      { quizId: quiz3Id, tagId: physicsTagId, createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('QuizTags', null, {});
    await queryInterface.bulkDelete('Questions', null, {});
    await queryInterface.bulkDelete('Quizzes', null, {});
    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
