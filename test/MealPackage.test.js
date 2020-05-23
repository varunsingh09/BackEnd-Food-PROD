//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
const { MealPackagesSchema } = require('../MasterAdmin-Portal/Models/MMealPackage.Model')

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('MealPackagesSchema', () => {
  beforeEach((done) => {
      MealPackagesSchema.remove({}, (err) => { //Before each test we empty the database
         done();
      });
  });
  /*
  * Test the /POST route
  */
  describe('/POST Master/MealPackage', () => {
      it('it should not POST a MealPackage without package_type, days, price_perday fields', (done) => {
          let mealPackage = {
              package_type: "oneperson",
              days: "3",
              // price_perday: 5.99
          }
        chai.request('http://localhost:3001')
            .post('/Master/MealPackage')
            .send(mealPackage)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('errors');
                  res.body.errors.should.be.a('array');
                  res.body.errors.length.should.be.eql(1);
                  res.body.errors[0].should.have.property('param').eql('price_perday');
              done();
            });
      });

  });




  /*
  * Test the /POST route
  */
  describe('/POST Master/MealPackage', () => {
      it('it should POST a MealPackage', (done) => {
          let mealPackage = {
              package_type: "oneperson",
              days: "3",
              price_perday: 5.99
          }
        chai.request('http://localhost:3001')
            .post('/Master/MealPackage')
            .send(mealPackage)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('response');
                  res.body.response.should.have.property('package_type').eql('oneperson');
                  res.body.should.have.property('msg').eql('Successfully Created Meal Package');
              done();
            });
      });

  });


});



describe('MealPackagesSchema mealPackage already exists', () => {
  /*
  * Test the /POST route
  */

  describe('/POST Master/MealPackage', () => {
      it('it should not POST a MealPackage, MealPackage already exists', (done) => {
          let mealPackage = {
              package_type: "oneperson",
              days: "3",
              price_perday: 5.99
          }
        chai.request('http://localhost:3001')
            .post('/Master/MealPackage')
            .send(mealPackage)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('errors');
                  res.body.errors[0].should.have.property('msg').eql('This package already exist');
              done();
            });
      });

  });
});
