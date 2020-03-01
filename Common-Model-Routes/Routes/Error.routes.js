const express = require('express');
var nodemailer = require('nodemailer');
require('dotenv').config();
const router = express.Router();
const { CaptureErrorsSchema } = require('./../../Common-Model-Routes/Models/Error.model');
//const { validationResult } = require("express-validator/check");


// Error Capture Route
// Post - localhost:3001/CaptureErr/ErrorCapture

router.post('/ErrorCapture', async function (req, res, next) {


    try {
    
            admin = new CaptureErrorsSchema({
                error: req.body.error,
                errorRoute: req.body.errorType,
                email: req.body.email,
                u_id: req.body.u_id,
                errorMethod:req.body.errorMethod,
                stripe_id:req.body.stripe_id,
                kitchen_name:req.body.kitchen_name
            
               
            });
    

            await admin.save();

            return res.status(200).json({ msg:'Succefully save Error in Database' });
    

        }  catch (error) {
            console.log(error);
            let str = `E11000 duplicate key error collection: FirstFoodApp.customersignups index`
    

            if (error.name === 'MongoError' && error.code === 11000) {
            let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1',' :')            
            console.log(error,"-------",ermsg)   
            return res.status(500).json({ errors:[{'msg':ermsg}] });
            } else {
                return res.status(500).json({ errors:[{error:error}] });
            }
        }


 

});



module.exports = router;