const factoryGirl = require('factory-girl')
const adapter = new factoryGirl.SequelizeAdapter()
const factory = factoryGirl.factory
factory.setAdapter(adapter)

const Models = require('../../models')

factory.cleanUp()
factory.factories = []

require('../factories')(factory, Models)

beforeEach(done => {
  Models.sequelize.sync({ force: true })
    .finally(() => {
      done()
    })
})

module.exports = { factory }