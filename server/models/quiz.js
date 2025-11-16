const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('Quiz', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    totalTimeMinutes: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    questionsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  })
}
