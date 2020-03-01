const express = require('express');
var nodemailer = require('nodemailer');
const router = express.Router();
const { MasterSignupSchema } = require('../../MasterAdmin-Portal/Models/MSignup-model')
//const { validateMeChecks } = require('./../middleware')
const { validationResult } = require("express-validator/check");
const { jwtSignin, jwtVerifyToken, validateMeChecks } = require('./../../middleware')
const bcrypt = require('bcrypt')
const rounds = 10


// Master Admin  Registration with HASH 
// Post - localhost:3001/Master/MSignup

router.post('/MSignup', validateMeChecks, async function (req, res, next) {

    console.log('hello yes')


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    }

    let admin = await MasterSignupSchema.findOne({ email: req.body.email},{phone_no:req.body.phone_no });

    

    if (admin) {

        return res.status(200).json({ errors: [{'msg':'This email already exit'}, {'msg':'this phone already exit'}] });

    } else {


    let hashPassword = bcrypt.hashSync(req.body.password, rounds);

    try {
        admin = new MasterSignupSchema({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashPassword,
            phone_no: req.body.phone_no,
            
        });


        await admin.save();


        return res.status(200).send({ response: admin, 'route': 'https://yahoo.com','msg': 'Successfully Created Master User' });


    } catch (error) {
        let str = `E11000 duplicate key error collection: test.masteradminsignups index`


            // This below code will capture error and store it to ERROR collection 
            errs = new CaptureErrorsSchema({
                error: error,
                errorRoute: 'MSignup',
                email: req.body.email
               
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