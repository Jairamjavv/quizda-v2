const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('attempter', 'contributor', 'admin'), allowNull: false, defaultValue: 'attempter' }
  })
}
