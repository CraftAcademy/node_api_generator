const app = require('../../app')
const supertest = require('supertest')
const expect = require('chai').expect
const { factory } = require('../helpers')

let server, request, response

before(done => {
  server = app.listen(done)
  request = supertest.agent(server)
});

after(done => {
  server.close(done)
});

beforeEach(async () => {
  // create your factories here
})

afterEach(async () => {
  await factory.cleanUp()
})


describe('GET /api/resource', () => {

  beforeEach(async () => {
    response = await request.get('/api/resource')
  });

  it('is expected to respond with status 200', () => {
    expect(response.status).to.equal(200)
  });

  it('is expected to respond with a list of 1 resource', () => {
    expect(response.body['resources'].length).to.equal(1)
  });

  describe('resource properties', () => {
    it('is expected to include :message & :nextStep', () => {
      const expectedJson = [{
        "message": "Your API is working",
        "nextStep": "Go on and create some magic!"
      }]
      expect(response.body['resources']).to.deep.equal(expectedJson)
    });
  });
});