const express = require('express');
const router = express.Router();
var path = require('path');
const { KitchenItemServingDays } = require('./../../Kitchen-Portal/Models/Kitchen_ItemDays.Model');
//const { item_type} = require('./../middleware')
//const { MasterAdminSignupSchema } = require('./../Models/Master_SignupSignin.Model');
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');

const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model');

// This API is to store Kitchen product serving days 
// This is incomplete has to be tested


router.post('/ItemServingDays', async (req, res, next) => {
  //console.log(req.body.item_type.length,"===",req.body.serving_days.length)
  let item_type = req.body.item_type.length <= 2 ? req.body.item_type[0] : req.body.item_type

  try {

    
    let product = await ProductSchema.count({ kitchen_name: req.body.kitchen_name, item_type: item_type });
    if (product === 0) {
      return res.status(200).json({ errors: [{ 'msg': 'This Kitchen dosnt exit' }] });

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

    if (req.body.serving_days.length >3  && item_type === "MainCourse") {
      return res.status(200).json({ errors: [{ 'msg': 'MainCourse item 3 days per week from one kitchen' }] });
    }

    
    if (req.body.item_type.length > 4 && item_type !== "MainCourse") {
      return res.status(200).json({ errors: [{ 'msg': 'Item 3 days per week from one kitchen' }] });
    }


    let items = await KitchenItemServingDays.count({ kitchen_name: req.body.kitchen_name, item_type: item_type, serving_days: req.body.serving_days });



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
      item_name: req.body.item_name,
      serving_days: req.body.serving_days,

    });
    let servingdaysRsponse = await servingdays.save();

    console.log("--->>",servingdaysRsponse)
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






module.exports = router;