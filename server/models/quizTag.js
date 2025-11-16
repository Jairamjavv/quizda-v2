const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('QuizTag', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
  })
}
