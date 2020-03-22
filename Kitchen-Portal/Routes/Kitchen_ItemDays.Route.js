const express = require('express');
const router = express.Router();
var path = require('path');
const { KitchenItemServingDays } = require('./../../Kitchen-Portal/Models/Kitchen_ItemDays.Model');
const { serving_zipcodes, } = require('./../../middleware')
//const { MasterAdminSignupSchema } = require('./../Models/Master_SignupSignin.Model');
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');
const { ZipcodeKitchensSchema } = require('./../../MasterAdmin-Portal/Models/MZipcode-Kitchen.model');

const { CaptureErrorsSchema } = require('./../../Common-Model-Routes/Models/Error.model');

// This API is to store Kitchen product serving days 
// This is incomplete has to be tested


router.post('/ItemServingDays', async (req, res, next) => {

  let serving_days = req.body.serving_days.map(Number)
  let serving_days_length = serving_days.length

  let item_type_length = typeof req.body.item_type === "object" ? req.body.item_type.map(String).length : 1

  let item_name_length = typeof req.body.item_name === "object" ? req.body.item_name.map(String).length : 1

  let item_name = item_name_length > 1 ? req.body.item_name[0] : req.body.item_name
  let item_type = item_type_length > 1 ? req.body.item_type[0] : req.body.item_type


  try {


    let product = await ProductSchema.count({ kitchen_name: req.body.kitchen_name, item_name: item_name });

    if (product === 0) {
      return res.status(200).json({ errors: [{ 'msg': 'This Kitchen or item dose not exit' }] });

    }


  } catch (error) {

    let str = `E11000 duplicate key error collection: test.products index`

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(200).json({ errors: { 'msg': [error.errmsg.replace(str, `There was a duplicate key error in`).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')] } });
    } else {
      next(error);
    }
  }



  try {


    if ((item_type_length > 3 && item_type === "MainCourse") && serving_days_length > 3) {

      //console.log("come")

      return res.status(200).json({ errors: [{ 'msg': 'Only 3 maincourse Item PER DAY from one kitchen.' }] });
    }


    if (item_type === "MainCourse" && serving_days_length > 3) {
      return res.status(200).json({ errors: [{ 'msg': 'Max 3 Days per week same item can be served by kitchen.' }] });
    }


    let items = await KitchenItemServingDays.count({ kitchen_name: req.body.kitchen_name, item_type: item_type, serving_days: serving_days, item_name: item_name });



    if (items !== 0) {
      return res.status(200).json({ errors: [{ 'msg': 'Item already serving by this kitchen' }] });

    }

  } catch (error) {

    let str = `E11000 duplicate key error collection: test.itemservingdays index`

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(200).json({ errors: { 'msg': [error.errmsg.replace(str, `There was a duplicate key error in`).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')] } });
    } else {
      next(error);
    }
  }


  try {

    servingdays = new KitchenItemServingDays({
      kitchen_name: req.body.kitchen_name,
      u_id: req.body.u_id,
      item_type: item_type,
      item_name: item_name,
      serving_days: serving_days,

    });
    let servingdaysRsponse = await servingdays.save();

    //console.log("--->>",servingdaysRsponse)
    return res.status(200).json({ success: [{ 'msg': 'Serving days save successfully.' }] });

  } catch (error) {

    let str = `E11000 duplicate key error collection: test.itemservingdays index`

    if (error.code !== 11000) {

      errs = new CaptureErrorsSchema({
        error: error,
        errorRoute: 'ItemServingDays',
        kitchen_name: req.body.kitchen_name


      });


      await errs.save();

      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(200).json({ errors: { 'msg': [error.errmsg.replace(str, `There was a duplicate key error in`).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')] } });
      } else {
        next(error);
      }
    }
  }

})


//check serving zipcode


router.post('/ItemServingZipCodes', async (req, res, next) => {


  let zipcodes = typeof req.body.zipcodes === "string" ? [req.body.zipcodes] : req.body.zipcodes

  let requestedZipCodes = zipcodes.map(Number)

  //console.log(serving_zipcodes, "<<====>>", requestedZipCodes)
  let notExistZipcodes = requestedZipCodes.filter(x => !serving_zipcodes.includes(x));

  //console.log("find elements", intersection)
  if (notExistZipcodes.length > 0) {
    return res.status(200).json({ data: [{ 'error': 'We are not serving these zipcodes', "notserving_zipcodes": notExistZipcodes, 'success': 'We are serving these zipcodes', "serving_zipcodes": serving_zipcodes }] });
  }

  let kitchen_names = typeof req.body.kitchen_names === "object" ? req.body.kitchen_names.map(String) : req.body.kitchen_names

  //console.log("---------------", kitchen_names)
  let product = await ProductSchema.count({ kitchen_name: kitchen_names, u_id: req.body.u_id });

  if (product === 0) {
    return res.status(200).json({ errors: [{ 'msg': 'This Kitchen dose not exit' }] });

  }

  let zipcodesData = await ZipcodeKitchensSchema.find({ zipcodes: zipcodes, kitchen_names: kitchen_names });

  //console.log("---------------", zipcodesData.length===0)
  if (zipcodesData.length === 0) {

    try {

      zipcodesDataArray = new ZipcodeKitchensSchema({
        kitchen_names: kitchen_names,
        zipcodes: zipcodes,
        state: 'chicago',
      });

      let zipcodesDataResponse = await zipcodesDataArray.save();

      //console.log("--->>",servingdaysRsponse)
      return res.status(200).json({ success: [{ 'success': 'Data saved successfully', "data": zipcodesDataResponse }] });

    } catch (error) {

      let str = `E11000 duplicate key error collection: test.ZipcodeKitchensSchema index`

      if (error.code !== 11000) {

        errs = new CaptureErrorsSchema({
          error: error,
          errorRoute: 'ZipcodeKitchensSchema',
          kitchen_name: kitchen_names


        });


        await errs.save();

        if (error.name === 'MongoError' && error.code === 11000) {
          return res.status(200).json({ errors: { 'msg': [error.errmsg.replace(str, `There was a duplicate key error in`).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')] } });
        } else {
          next(error);
        }
      }
    }

  } else {
    return res.status(200).json({ errors: [{ 'success': 'These kitchen already serving zipcodes', "serving_zipcodes": zipcodesData }] });

  }

})



module.exports = router;