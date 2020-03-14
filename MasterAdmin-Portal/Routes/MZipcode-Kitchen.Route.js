const express = require('express');
const router = express.Router();
const { ZipcodeKitchensSchema } = require('./../../MasterAdmin-Portal/Models/MZipcode-Kitchen.model')
const { KitchenSignupSchema} = require('./../../Kitchen-Portal/Models/KSignup-model');
const { serving_zipcodes} = require('./../../middleware')
const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model')

// Post 
// Below Route is master admin to enter zipcode and kitchens ,this will tell which kitchen is serving which zipcodes 
// localhost:3001/ZipcodesKitchens/ZipcodeKitchens

// - validate zipcode from middleware ( if zipcode not in that middleware say invalid zipcode)
// - zipcode cannot be duplicate in collection 
// - validate kitchen name ( if kitchen name dosnt exist ,say invalide kitchen )
// - duplicate kitchen name is not allwoed 

// Not completed -work in progress



router.post('/ZipcodeKitchens', async function (req, res, next) {

    console.log(serving_zipcodes, req.body.zipcodes)

    // bulk kitchen name validation needed ,mention which kitchen name dosnt exist to user
    // let masteradmin = await KitchenSignupSchema.findOne({ kitchen_name: req.body.kitchen_name });

   
    if (masteradmin === null) {
       
        return res.status(200).json({ errors: [{ 'msg': 'This Kitchen dosnt exit',param:'kitchen_name' }] });
    }
  

    // bulk zipcode validation needed ,mention which zipcode dosnt exist to user


    // let zipcodes = await serving_zipcodes.findOne({ zipcodes: req.body.zipcodes });


   
    // if (zipcodes=== null) {
       
    //     return res.status(200).json({ errors: [{ 'msg': 'This zipcode dosnt exit',param:'kitchen_name' }] });
    // }
  


    

    try {
        admin = new ZipcodeKitchensSchema({

            state: req.body.state,
            zipcodes: req.body.zipcodes,
            kitchen_names: req.body.kitchen_names,
            
        });


        await admin.save();

        
        return res.status(200).send({ response: admin, 'msg': 'Successfully Added Zipcodes with kitchens' });


       


    } catch (error) {
        let str = `E11000 duplicate key error collection: test.masteradminsignups index`

     
            // This below code will capture error and store it to ERROR collection 

            if(error.code !==11000){
                
                errs = new CaptureErrorsSchema({
                    error: error,
                    errorRoute: 'ZipcodeKitchens',
                    
                   
                });
        
    
                await errs.save();
    
    
    
            }
            


        if (error.name === 'MongoError' && error.code === 11000) {
        let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1',' :')            
        console.log(error,"-------",ermsg)   
        return res.status(200).json({ errors:[{'msg':ermsg}] });
        } else {
            next(error);
        }
    }

});

module.exports = router;