const express = require('express');
const router = express.Router();
const { StateCitySchema } = require('./../../Common-Model-Routes/Models/StateCity.model');
const { authenticateToken } = require('./../../middleware/jwt')
const client = require('./../../middleware/redis')


const path = require('path');
const fs = require('fs')
var ObjectId = require('mongodb').ObjectID



async function AddtoDb(StateName, cityListdata) {
  var cityData = {
    state: StateName,
    cityList: cityListdata
  };
  console.log(cityData);
  var id = cityData._id;

  var userCrendatialToUpdate = {};
  userCrendatialToUpdate = Object.assign(userCrendatialToUpdate, cityData);
  delete userCrendatialToUpdate._id;
  console.log(userCrendatialToUpdate);
  var query = { '_id': ObjectId(id) };
  var x = await StateCitySchema.findOneAndUpdate(query, userCrendatialToUpdate, { upsert: true });
  console.log(x);
}


// Below link will upload data.json file in to mongodb collection 
// Get - /API/states/readJsonFile
router.get('/readJsonFile', async (req, res) => {

  //exports.readJsonFile =async function (req, res) {
  var directoryName = __dirname;
  let reqPath = path.join(__dirname, './../../utils/data.json');

  var objJson = await JSON.parse(fs.readFileSync(reqPath, 'utf8'));
  for (var key in objJson) {
    if (objJson.hasOwnProperty(key)) {
      await AddtoDb(key, objJson[key])
    }
  };
  res.send("saved.");
});



// This will fetch all state & city from mongo database schema 
// Get - /API/states/AllStateCity


router.get('/AllStateCity', async (req, res, next) => {


  const rawData = await client.getAsync('city_list');


  if (rawData !== null) {
    console.log("==", rawData, "----", JSON.parse(rawData))
    let List = JSON.parse(rawData)
    return res.status(200).send({ 'result': List })
  }

  try {

    let List = await StateCitySchema.find({}, { 'state': 1, 'cityList': 1, '_id': 0 }).lean(true).skip(0)
      .limit(0);


    if (List.length == 0) {

      res.status(200).send({ "errors": "No Record Found in State & City Database" })

    } else {
      await client.setAsync('city_list', JSON.stringify(List));

      res.status(200).send({ 'result': List })
    }

  } catch (error) {


  }

})



module.exports = router;


