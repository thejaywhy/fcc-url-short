//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.DB_URI = "mongodb://localhost/testDatabase"
process.env.DB = "testShort"
process.env.COLLECTION = "testUrls"

var server = require('../server');

var sinon = require('sinon');
var mongoose = require('mongoose');
require ('sinon-mongoose');

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);


// Load the model
var UrlShort = require('../models/urlshort');

const sandbox = sinon.sandbox.create();

describe('App', () => {

  before(() => {
  });

  // Share connection for all tests
  beforeEach((done) => { 
    mongoose.connection.db.dropDatabase(done);
  });

  describe('When I visit /', () => {
    it('it should return the index view', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;

          done();
        });
    })
  });

  describe('When I pass a URL as a parameter', () => {
    it('it should return a shortened URL in a JSON response', (done) => {
      var expUrl = 'https://freecodecamp.org';
      var expShort = '412557052';
      chai.request(server)
        .post('/api/shorten')
        .send({url: expUrl})
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('original');
          res.body.should.have.property('short');
          res.body.should.not.have.property('error');

          res.body.short.should.equal(expShort);
          res.body.original.should.equal(expUrl);

          done();
        });
    }),

    it('it should return a JSON error reponse for invalid URLs', (done) => {
      chai.request(server)
        .post('/api/shorten')
        .send({url: "this isn't a url at all"})
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.should.not.have.property('original');
          res.body.should.not.have.property('short');

          res.body.error.should.equal("Invalid URL");

          done();
        });
    })
  });

  describe("When I want to see the config of a shortened URL", () => {
    it('it should return a JSON response', (done) => {
      var UrlShortMock = sinon.mock(UrlShort);
      var expectedResult = {short: "apple", original:"https://apple.com"};
      UrlShortMock.expects('find').yields(null, expectedResult);

      chai.request(server)
        .get('/api/apple')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('original');
          res.body.should.have.property('short');

          res.body.original.should.not.be.null;
          res.body.short.should.not.be.null;
          done();
        });
    });
  });

  describe("When I visit the shortened URL", () => {
    it('it should redirect me to the original link', (done) => {
      var UrlShortMock = sinon.mock(UrlShort);
      var expectedResult = {short: "apple2", original:"https://apple.com"};
      UrlShortMock.expects('find').yields(null, expectedResult);

      chai.request(server)
        .get('/apple2')
        .end((err, res) => {
          res.should.have.status(302);
          res.headers.Location.to.equal(expectedResult.original);

          done();
        });
    })
  });

  //Drop db connect after all tests
  after(function(done){
    sandbox.restore();
    mongoose.connection.db.dropDatabase(function(){
      mongoose.connection.close(done);
    });
  });

});
