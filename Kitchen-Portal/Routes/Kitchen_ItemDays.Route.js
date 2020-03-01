const express = require('express');
const router = express.Router();
var path = require('path');
const { KitchenItemServingDays } = require('./../../Kitchen-Portal/Models/Kitchen_ItemDays.Model');
//const { item_type} = require('./../middleware')
//const { MasterAdminSignupSchema } = require('./../Models/Master_SignupSignin.Model');
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');



// This API is to store Kitchen product serving days 
// This is incomplete has to be tested


  router.post('/ItemServingDays', async (req, res, next) => {


    try {

       let product = await ProductSchema.findOne({ kitchen_name:req.body.kitchen_name,item_title:req.body.item_name});
        console.log(product ===null)

        if (product === null) {
        console.log('come')
        return res.status(200).json({ errors: [{'msg':'This Kitchen dosnt exit'}] });
        
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

      let items = await KitchenItemServingDays.findOne({ kitchen_name:req.body.kitchen_name,item_title:req.body.item_name});
      //console.log(items ===null)

      if (items === null) {
        console.log('come')
           return res.status(200).json({ errors: [{'msg':'Item already serving by this kitchen'}] });
            
          }

    }catch (error) {

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
    item_type: req.body.item_type,
    item_name: req.body.item_name,
    serving_days : req.body.serving_days,
   
  });

  await servingdays.save();

}catch (error) {

  let str = `E11000 duplicate key error collection: test.itemservingdays index`

  if(error.code !==11000){
                
    errs = new CaptureErrorsSchema({
        error: error,
        errorRoute: 'ItemServingDays',
        kitchen_name:req.body.kitchen_name
       
       
    });


    await errs.save();

  if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(200).json({ errors: { 'msg': [error.errmsg.replace(str, `There was a duplicate key error in`).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')] } });
  } else {
      next(error);
  }
}


}})






module.exports = router;