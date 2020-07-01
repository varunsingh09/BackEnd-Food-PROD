const express = require('express');
const router = express.Router();
const { ZipcodeKitchensSchema } = require('./../../MasterAdmin-Portal/Models/MZipcode-Kitchen.model')
const { ProductSchema } = require('./../../MasterAdmin-Portal/Models/MProduct.model');
const { serving_zipcodes, } = require('./../../middleware/utils')
const { CaptureErrorsSchema } = require('./../../Common-Model-Routes/Models/Error.model')

// Post 
// Below Route is master admin to enter zipcode and kitchens ,this will tell which kitchen is serving which zipcodes 
// localhost:3001/ZipcodesKitchens/ZipcodeKitchens

// - validate zipcode from middleware ( if zipcode not in that middleware say invalid zipcode)
// - zipcode cannot be duplicate in collection 
// - validate kitchen name ( if kitchen name dosnt exist ,say invalide kitchen )
// - duplicate kitchen name is not allwoed 

// Not completed -work in progress


router.post('/ZipcodeKitchens', async (req, res, next) => {

    let email = "sayed@gmail.com"

    if (email !== req.body.email) {
        return res.status(200).json({ data: [{ 'error': 'You are not authorize person to access this api.', "email": req.body.email }] });

    }


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
    let product = await ProductSchema.count({ kitchen_name: kitchen_names });

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




router.post('/ZipcodeKitchensList', async (req, res, next) => {


    let kitchen_names = typeof req.body.kitchen_names === "object" ? req.body.kitchen_names.map(String) : req.body.kitchen_names

    let state = req.body.state

    //console.log("body request ",req.body)

    const match = {}
    if (req.body.state !== undefined) {
        match.state = req.body.state
    }
    if (req.body.zipcode !== undefined) {
        match.zipcodes = { "$in": req.body.zipcode }
    }

    console.log("=========>", match)
    
    let product = await ProductSchema.count({ kitchen_name: kitchen_names });

    if (product === 0) {
        return res.status(200).json({ errors: [{ 'msg': 'This Kitchen dose not exit' }] });

    }

    let zipcodesData = await ZipcodeKitchensSchema.find(match);


    return res.status(200).json({ success: [{ 'msg': 'Zipcode with kitchen', 'zipcode_data': zipcodesData }] });



})



module.exports = router;