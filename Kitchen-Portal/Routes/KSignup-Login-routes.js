const express = require('express');
const router = express.Router();
const { KitchenSignupSchema } = require('./../../Kitchen-Portal/Models/KSignup-model')
const { validationResult } = require("express-validator");
const { validateMeChecks, CustomerSignInValidations } = require('./../../middleware/utils')
const { sendEmail } = require('./../../middleware/email')
const { jwtSignin, jwtVerifyToken } = require('./../../middleware/jwt')
const { CaptureErrorsSchema } = require('./../../Common-Model-Routes/Models/Error.model')
const client = require('./../../middleware/redis')
const bcrypt = require('bcrypt')
const rounds = 10
var nodemailer = require("nodemailer");




// Kitchen SignUP
// Kitchen Registration Signup with HASH 
// Post - localhost:3001/kitchen/KitchenSignup
router.post('/KitchenSignup', validateMeChecks, async function (req, res, next) {

    const errors = validationResult(req);
    //console.log(req.body)

    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array({ onlyFirstError: true }) });
    }


    let ErrMsg = [];
    let IsalreadyExist = false;


    let adminK = await KitchenSignupSchema.findOne({ kitchen_name: req.body.kitchen_name });
    if (adminK !== null) {
        IsalreadyExist = true;
        ErrMsg.push({ msg: "Kitchen already exist", param: 'kitchen_name' });
        //ErrMsg.Kitchen="Kitchen already exist";

    }

    let adminE = await KitchenSignupSchema.findOne({ email: req.body.email });
    if (adminE !== null) {
        IsalreadyExist = true;
        ErrMsg.push({ msg: "Email already exist", param: 'email' });
        //ErrMsg.Email="Email already exist";

    }

    let adminP = await KitchenSignupSchema.findOne({ contact_no: req.body.contact_no });
    if (adminP !== null) {
        IsalreadyExist = true;
        ErrMsg.push({ msg: "Phone already exist", param: 'contact_no' });
        //ErrMsg.Phone="Phone already exist";

    }


    if (IsalreadyExist) {
        return res.status(401).json({ errors: ErrMsg });

        // return res.status(200).json({ errors: [{'msg': ErrMsg+ ' already exist in database,please use unique with group'}] });

    } else {



        let hashPassword = bcrypt.hashSync(req.body.password, rounds);

        try {
            admin = new KitchenSignupSchema({
                kitchen_name: req.body.kitchen_name,
                address: req.body.address,
                state: req.body.state,
                city: req.body.city,
                zipcode: req.body.zipcode,
                email: req.body.email,
                password: hashPassword,
                contact_no: req.body.contact_no,
                agreement_policy: req.body.agreement_policy,
            });


            await admin.save();

            sendEmail(req, res, next, admin)

            return res.status(200).send({ success: admin, 'route': 'https://yahoo.com', 'Msg': 'Successfully Created Master User' });


        } catch (error) {
            let str = `E11000 duplicate key error collection: test.masteradminsignups index`


            // This below code will capture error and store it to ERROR collection 

            if (error.code !== 11000) {

                errs = new CaptureErrorsSchema({
                    error: error,
                    errorRoute: 'KitchenSignup',
                    email: req.body.email,
                    kitchen_name: req.body.kitchen_name


                });

                await errs.save();

            }

            if (error.name === 'MongoError' && error.code === 11000) {
                let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1', ' :')
                return res.status(401).json({ errors: [{ 'msg': ermsg }] });
            } else {
                next(error);
            }
        }

    }
});





// Email send Kitchen Login 
// This Api we are using on kitchen login page to validate email on the fly.
// Post -localhost:3001/kitchen/KitchenEmailVerify


router.post('/KitchenSendEmail', async (req, res, next) => {

    //console.log(req.body._id)
    // Check if this user already exisits
    let admin = await KitchenSignupSchema.findOne({ _id: req.body._id, status: true });
    if (admin == null) {

        return res.status(401).json({ errors: [{ "msg": 'That admin dose not exisits! Or deactivated, Please resend email' }] });

    }
    //console.log('come')
    sendEmail(req, res, next, admin, template = 'default')

});


//logout kitchen - to delete token from server 
// this code is pending ,incomplete code , this has to delete token from server side 
// this url you will see at kitchen sign in page 

router.post('/KitchenSignInLogout', async (req, res, next) => {

    let accessToken = req.headers['authorization']
    let refresh_token = accessToken && accessToken.split(' ')[1]
    let { userId } = req.body

    let tokenData = await client.getAsync(`tokenList_${userId}`);
    let tokenList = tokenData === null ? {} : JSON.parse(tokenData)

    //console.log(userId,"---", Object.values(tokenList))

    Object.values(tokenList).filter(token => token !== refresh_token)
    await client.delAsync(`tokenList_${userId}`);

    //console.log('deleted', userId)
    return res.status(201).send({ success: { "msg": 'Logout sucessfuly', logout: true } });

});


// Kitchen Login 
// This API will generate JWT token when on successful sign in 
// Post - localhost:3001/kitchen/KitchenLogin



router.post('/KitchenLogin', CustomerSignInValidations, async (req, res, next) => {
    console.log("======",req.body)
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array({ onlyFirstError: true }) });
    }


    // Check if this user already exisits
    let admin = await KitchenSignupSchema.findOne({ email: req.body.email, status: true });
    if (admin == null) {

        return res.status(401).json({ errors: [{ "msg": 'That admin dose not exisits! Or deactivated, Please contact Administrator' }] });

    }
    let compPassword = bcrypt.compareSync(req.body.password, admin.password)

    if (compPassword == false) {

        return res.status(401).json({ errors: [{ "msg": 'Incorrect Password!! Or  Account deactivated, Please check login details' }] });

    } else {

        try {
            let adminId = admin._id
            jwtSignin(req, res, next, adminId, admin)

        } catch (err) {
            return next(err)
        }
    }
});




// This Route is for email verfication through email,and will update its status to true 
// Get - localhost:3001/kitchen/verifyEmail
router.post('/verifyEmail', async (req, res, next) => {

    // Check if this user already exisits
    if (req.body._id !== "") {
        try {

            let admin = await KitchenSignupSchema.findOneAndUpdate({ _id: req.body._id }, { status: true })


            res.status(200).send({ updated: true, success: admin });

        } catch (err) {
            return next(err)
        }
    } else {
        res.status(401).send({ "error": 'Something is missing.', updated: false, });
    }


});



// Refresh Token 
// This API will refresh JWT token when token is expire
// Post - localhost:3001/kitchen/token



router.post('/token', async (req, res, next) => {

    jwtVerifyToken(req, res, next)
});


module.exports = router;