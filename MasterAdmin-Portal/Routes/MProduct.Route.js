const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const Jimp = require('jimp');


var path = require('path');
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');
const { ImagesSchema } = require('./../../MasterAdmin-Portal/Models/MImages.model');
const { KitchenSignupSchema} = require('./../../Kitchen-Portal/Models/KSignup-model');
const { upload,item_type,serving_temp,allergic_ingredients,special_markings} = require('./../../middleware')
const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model')

//const { redisSetKey, client } = require('../redis')




// This route is to ADD PRODUCT for master admin portal
// This API is taking product detail and product image  storing in 2 collections ( products and product_image)
// After image is upload before it get saved its cropping it 2 3 different sizes



router.post('/Addproduct', upload.single("image"),async (req, res, next) => {
    
  console.log(req.body)
  const files = req.file;

  if (!files) {
      return res.status(200).json({ errors: [{ 'msg': 'Please uplaod image' }] });
  }

  let masteradmin = await KitchenSignupSchema.findOne({ kitchen_name: req.body.kitchen_name });

  console.log(masteradmin)
  if (masteradmin === null) {
      //fs.unlinkSync(req.file.path)
      return res.status(200).json({ errors: [{ 'msg': 'This Kitchen dosnt exit',param:'kitchen_name' }] });
  }

  let admin = await ProductSchema.findOne({ kitchen_name: req.body.kitchen_name, item_name: req.body.item_name });
  if (admin) {
      //fs.unlinkSync(req.file.path)
      return res.status(200).json({ errors: [{ 'msg': 'This item already exit with this kitchen',param:'kitchen_name'}] });

  } else {
      try {

          let u_id = Math.floor(Math.random() * 100 + 1);
          product = new ProductSchema({
              kitchen_name: req.body.kitchen_name,
              u_id: u_id,
              item_type: req.body.item_type,
              ingredients: req.body.ingredients,
              serving_temp: req.body.serving_temp,
              item_name: req.body.item_name,
              recipe_with: req.body.recipe_with,
              single_size: req.body.single_size,
              double_size: req.body.double_size,
              allergic_ingredients: req.body.allergic_ingredients,
              special_markings: req.body.special_markings,
              status: req.body.status,

          });

          await product.save();
        

          if (product._id) {
              
              Jimp.read(req.file.path, function (err, img) {
                  if (err) return res.status(200).json({ errors: [{ 'msg': err }] });
                  let sizeArr = [500, 400, 300]
                  let height = 200;
                  let imageArr = []
                  let results = sizeArr.map((width, index) => {
                      img.resize(width, height)            // resize
                          .quality(100)                 // set JPEG quality
                          .write(`assets/${width}x${height}_${req.file.filename}`); // save
                      return `${width}x${height}_${req.file.filename}`


                  })

                  imageArr = [req.file.filename,...new Set(results)];
                  Images = new ImagesSchema({
                      filename: imageArr,
                      product_id: product._id,
                      kitchen_name: product.kitchen_name
  
                  });
  
                  Images.save();
                  return res.status(200).send({
                      product: product, "message": "Data save successfully with image.",
                      "images": imageArr
                  });

              });               
          }

      } catch (error) {

          let str = `E11000 duplicate key error collection: test.masteradminsignups index`

              // This below code will capture error and store it to ERROR Captured collection 
              errs = new CaptureErrorsSchema({
                error: error,
                errorRoute: 'Addproduct',
                email: req.body.email,

                kitchen_name: req.body.kitchen_name
               
            });
    

            await errs.save();




          if (error.name === 'MongoError' && error.code === 11000) {
              let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')
              return res.status(200).json({ errors: [{ 'msg': ermsg }] });
          }else if (error.name === 'ValidationError') {
             return res.status(200).json({ errors: [{ 'msg': error.message.replace(/[':'",.<>\{\}\[\]\\\/]/gi, "")}] });
          } else {
              next(error);
          }
      }
  }

});



// Route to fetch All product list Along with product images
// we are fetching from two diffrent collections 

router.get('/AllProducts', async function (req,res){


  try {
  let products = await ProductSchema.aggregate([
    {
        "$lookup":
        {
            "from": "product_images",
            "localField": "products._id",
            "foreignField": "product_images.product_id",
            "as": "imageDetails"
        }
    },
    {
        "$project": {
  
            "item_type": "$$ROOT.item_type",
            "kitchen_name": "$$ROOT.kitchen_name",
            "item_name": "$$ROOT.item_name",
            "u_id": "$$ROOT.u_id",

            "imageDetails": {
                "filename": "$imageDetails.filename",
                "product_id": "$imageDetails.product_id"
            }
        },
    },
    { "$unwind": "$imageDetails" },
    //{ $match: { kitchen_name: req.body.kitchen_name } },
  
  ]);
  
  console.log(products)
  return res.status(200).send({ "results": products })

  } catch (error) {
    return res.status(200).json({ errors: [{ 'msg': error }] });

  }

})






// Below Route is to fetch data which is stored in middleware.js file 
// Get - /API/products/preSetData'
// redis is set to use in cache 

router.get('/preSetData', function (req, res) {
  console.log('hello', serving_temp)
    
  //await redisSetKey('PreSetData', list) // redis code 

  return res.status(200).send({ 
    "item_type": item_type,
    "serving_temp":serving_temp,
    "allergic_ingredients":allergic_ingredients,
    "special_markings":special_markings});

});


  module.exports = router;