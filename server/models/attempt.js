const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('Attempt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    score: { type: DataTypes.FLOAT, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    finishedAt: { type: DataTypes.DATE, allowNull: true },
    answers: { type: DataTypes.JSON, allowNull: true }
  })
}
