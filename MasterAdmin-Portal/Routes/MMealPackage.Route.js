const express = require('express');
const router = express.Router();
const { MealPackagesSchema } = require('../../MasterAdmin-Portal/Models/MMealPackage.Model')
const { validationResult } = require("express-validator/check");
const { validateMealPackageFields } = require('./../../middleware')

// Meal Package Route 
// Post - localhost:3001/Master/MealPackage

router.post('/MealPackage',validateMealPackageFields, async function (req, res, next) {


    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    }

  
    let admin = await MealPackagesSchema.findOne({ package_type:req.body.package_type},{days:req.body.days});

    

    if (admin) {

        return res.status(200).json({ errors: [{'msg':'This email already exit'}, {'msg':'this phone already exit'}] });

    } else 
    
    {



        //const calculate =  
    

    try {
        admin = new MealPackagesSchema({
            package_type: req.body.package_type,
            days: req.body.days,
            price_perday: req.body.price_perday,
            total_price: req.body.total_price,
            stripe_plan_id: req.body.stripe_plan_id
            
        });


        await admin.save();


        return res.status(200).send({ response: admin, 'msg': 'Successfully Created Meal Package' });


    } catch (error) {
        let str = `E11000 duplicate key error collection: test.masteradminsignups index`


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




module.exports = router;