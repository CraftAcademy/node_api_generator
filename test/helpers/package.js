const {path} = require('./index')

const packageContent = dir => ({
  "name": path.basename(dir),
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "start:dev": "nodemon --inspect ./bin/www",
    "test": "NODE_ENV=test NODE_NO_WARNINGS=1 mocha --recursive --exit $(find specs -name '*.spec.js')"
  },
  "dependencies": {
    "cookie-parser": "^1.4.5",
    "express": "^4.17.1",
    "pg": "^8.5.1",
    "pg-hstore": "^2.3.3",
    "sequelize": "^6.5.0"
  },
  "devDependencies": {
    "chai": "^4.2.0",
    "factory-girl": "^5.0.4",
    "mocha": "^8.1.2",
    "nodemon": "^2.0.4",
    "supertest": "^4.0.2"
  }
})

module.exports = packageContent