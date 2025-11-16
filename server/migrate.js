const { sequelize, User, Category, Quiz, Question, Tag } = require('./models')

async function migrate() {
  try {
    await sequelize.authenticate()
    console.log('Database connected:', sequelize.options.storage)
    // create tables
    await sequelize.sync({ alter: true })
    console.log('Models synchronized')

    // seed minimal data if missing
    const catCount = await Category.count()
    if (catCount === 0) {
      const categories = ['General Knowledge', 'Science', 'Mathematics & Logic', 'Technology & Computing']
      for (const name of categories) {
        await Category.create({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
      }
      console.log('Seeded categories')
    }

    const userCount = await User.count()
    if (userCount === 0) {
      await User.create({ username: 'contrib', email: 'contrib@example.com', role: 'contributor' })
      await User.create({ username: 'att', email: 'att@example.com', role: 'attempter' })
      await User.create({ username: 'admin', email: 'admin@example.com', role: 'admin' })
      console.log('Seeded example users')
    }

    console.log('Migration complete')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed', err)
    process.exit(1)
  }
}

migrate()
