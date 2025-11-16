const path = require('path')
const { Sequelize } = require('sequelize')

const dbPath = path.resolve(__dirname, '..', 'database.sqlite')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
})

const User = require('./user')(sequelize)
const Category = require('./category')(sequelize)
const Quiz = require('./quiz')(sequelize)
const Question = require('./question')(sequelize)
const Tag = require('./tag')(sequelize)
const QuizTag = require('./quizTag')(sequelize)
const Attempt = require('./attempt')(sequelize)

// Associations
User.hasMany(Quiz, { foreignKey: 'contributorId', as: 'quizzes' })
Quiz.belongsTo(User, { foreignKey: 'contributorId', as: 'contributor' })

Category.hasMany(Quiz, { foreignKey: 'categoryId' })
Quiz.belongsTo(Category, { foreignKey: 'categoryId' })

Quiz.hasMany(Question, { foreignKey: 'quizId' })
Question.belongsTo(Quiz, { foreignKey: 'quizId' })

Quiz.belongsToMany(Tag, { through: QuizTag, foreignKey: 'quizId', otherKey: 'tagId' })
Tag.belongsToMany(Quiz, { through: QuizTag, foreignKey: 'tagId', otherKey: 'quizId' })

User.hasMany(Attempt, { foreignKey: 'userId' })
Attempt.belongsTo(User, { foreignKey: 'userId' })

Quiz.hasMany(Attempt, { foreignKey: 'quizId' })
Attempt.belongsTo(Quiz, { foreignKey: 'quizId' })

module.exports = { sequelize, User, Category, Quiz, Question, Tag, QuizTag, Attempt }
