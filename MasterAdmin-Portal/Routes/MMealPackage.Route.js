const express = require('express');
const router = express.Router();
const { MealPackagesSchema } = require('../../MasterAdmin-Portal/Models/MMealPackage.Model')
const { validationResult } = require("express-validator/check");
const { validateMealPackageFields } = require('./../../middleware')
const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model')
const stripe = require('stripe')(process.env.StripeSecretKey);

// Meal Package Route
// Post - localhost:3001/Master/MealPackage

router.post('/MealPackage',validateMealPackageFields, async function (req, res, next) {


    console.log("req.body.package_type: " + req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    }

    //if  user
    let admin = await MealPackagesSchema.findOne({ package_type:req.body.package_type, days:req.body.days, status:true});


    if (admin) {

        return res.status(200).json({ errors: [{'msg':'This package already exist'}] });

    } else

    {


    let total_price = req.body.price_perday * req.body.days;


    let stripeProducts = await stripe.products.list();

    let stripePackage = "";

    for(let product of stripeProducts.data){
      if (product.name == req.body.package_type){
        stripePackage = product;
        break;
      }
    }

    if(stripePackage == ""){
      stripePackage = await stripe.products.create(
                      {
                        name: req.body.package_type,
                        type: 'service',
                        description: req.body.package_type + " package"
                      }
                    );
    }


    console.log(stripePackage);

    let stripePlan = await stripe.plans.create(
                    {
                      amount:  total_price * 100,
                      currency: 'usd',
                      interval: 'month',
                      nickname: req.body.days + " days",
                      product: stripePackage.id
                    }
                  );

    console.log(stripePlan);

    try {
        admin = new MealPackagesSchema({
            package_type: req.body.package_type,
            days: req.body.days,
            price_perday: req.body.price_perday,
            total_price: total_price,
            stripe_plan_id: stripePlan.id,
            stripe_product_id: stripePackage.id,
            status: true

        });
        console.log("admin: " + admin);

        await admin.save();


        return res.status(200).send({ response: admin, 'msg': 'Successfully Created Meal Package' });


    } catch (error) {
      console.log(error);
        let str = `E11000 duplicate key error collection: test.masteradminsignups index`

        //console.log(error);
            // This below code will capture error and store it to ERROR collection
            errs = new CaptureErrorsSchema({
                error: error,
                errorRoute: '/MealPackage',


            });


            await errs.save();



        if (error.name === 'MongoError' && error.code === 11000) {
        let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1',' :')
        console.log(error,"-------",ermsg)
        return res.status(200).json({ errors:[{'msg':ermsg}] });
        } else {
            next(error);
        }
    }

}});




// Meal Package  LIST     { Have to test this API before we integrate }
// This Route is to fetech all Meal Packages list
// GET- localhost:3001/Master/GetListMealPackages

router.get('/GetListMealPackages', async(req,res,next) => {



    try {

        let package_count = await MealPackagesSchema.find({}).count();

        let mealpackages = await MealPackagesSchema.find({},{'package_type':1,'days':1,'price_perday':1,'total_price':1,'stripe_plan_id':1,'status':1,'_id':0}).lean(true).skip(0).
        sort({"_id":-1}).limit(10);


             if(mealpackages.length==0)
             {res.status(200).send({"errors":"No Record Found in Database"})}
             else { res.status(200).send({'result': mealpackages,"package_count":package_count})}

    } catch (error){


    }

})




module.exports = router;
