const express = require('express');
const router = express.Router();
var path = require('path');
const { KitchenItemServingDays } = require('./../../Kitchen-Portal/Models/Kitchen_ItemDays.Model');
//const { MasterAdminSignupSchema } = require('./../Models/Master_SignupSignin.Model');
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');
const { CaptureErrorsSchema } = require('./../../Common-Model-Routes/Models/Error.model');

// This API is to store Kitchen product serving days 
// This is incomplete has to be tested

//for kitchen login display only selected kitchen data

router.post('/ItemServingDays', async (req, res, next) => {

  //let serving_days = req.body.serving_days.map(Number)
  let serving_days = typeof req.body.serving_days === "object" ? req.body.serving_days.map(Number) : [req.body.serving_days[0]].map(Number)

  let date = new Date();
  let day = date.getDay()

  //console.log("---------", serving_days)

  let currentDay = serving_days.every(function (e) {
    return e >= day;
  });


  if (currentDay === false) {

    return res.status(200).json({ errors: [{ 'msg': 'Previous days can not be update' }] });

  }

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
    return res.status(200).json({ success: [{ 'msg': 'Serving days save successfully.', "data": servingdaysRsponse }] });

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


//portal display kitchen name with item
router.post('/ItemServingDaysMatserAdmin', async (req, res, next) => {
  //console.log("---", typeof req.body.serving_days)
  let kitchen_name = `chicago kitchen`

  let serving_days = typeof req.body.serving_days === "object" ? req.body.serving_days.map(Number) : [req.body.serving_days[0]].map(Number)

  //console.log("--->>>", serving_days)

  let date = new Date();
  let day = date.getDay()

  //console.log("---------", serving_days)
  let currentDay = serving_days.every(function (e) {
    return e >= day;
  });


  if (currentDay === false) {

    return res.status(200).json({ errors: [{ 'msg': 'Previous days can not be update' }] });

  }

  let serving_days_length = serving_days.length

  let item_type_length = typeof req.body.item_type === "object" ? req.body.item_type.map(String).length : 1

  let item_name_length = typeof req.body.item_name === "object" ? req.body.item_name.map(String).length : 1

  let item_name = item_name_length > 1 ? req.body.item_name[0] : req.body.item_name
  let item_type = item_type_length > 1 ? req.body.item_type[0] : req.body.item_type
  
  try {

    let product = await ProductSchema.count({ kitchen_name: kitchen_name, item_name: item_name });

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

    let items = await KitchenItemServingDays.count({ kitchen_name: kitchen_name, item_type: item_type, serving_days: serving_days, item_name: item_name });

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
      kitchen_name: kitchen_name,
      u_id: req.body.u_id,
      item_type: item_type,
      item_name: item_name,
      serving_days: serving_days,

    });
    let servingdaysRsponse = await servingdays.save();

    //console.log("--->>",servingdaysRsponse)
    return res.status(200).json({ success: [{ 'msg': 'Serving days save successfully.', "data": servingdaysRsponse }] });

  } catch (error) {

    let str = `E11000 duplicate key error collection: test.itemservingdays index`

    if (error.code !== 11000) {

      errs = new CaptureErrorsSchema({
        error: error,
        errorRoute: 'ItemServingDays',
        kitchen_name: kitchen_name


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



module.exports = router;