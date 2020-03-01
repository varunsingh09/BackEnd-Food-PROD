const express = require('express');
var nodemailer = require('nodemailer');
const router = express.Router();
const { KitchenSignupSchema } = require('./../../Kitchen-Portal/Models/KSignup-model')
//const { validateMeChecks } = require('./../middleware')
const { validationResult } = require("express-validator/check");
const { jwtSignin, jwtVerifyToken, validateMeChecks,CustomerSignInValidations } = require('./../../middleware')
const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rounds = 10
//const { redisSetKey, client } = require('./../../redis')




// Kitchen SignUP
// Kitchen Registration Signup with HASH 
// Post - localhost:3001/kitchen/KitchenSignup
router.post('/KitchenSignup', validateMeChecks, async function (req, res, next) {


    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    }


     let ErrMsg=[];
     let IsalreadyExist=false;
 

    let adminK = await KitchenSignupSchema.findOne({kitchen_name:req.body.kitchen_name});
    if  (adminK!==null)
    {
        IsalreadyExist=true;
        ErrMsg.push( {msg:"Kitchen already exist", param:'kitchen_name'} );
        //ErrMsg.Kitchen="Kitchen already exist";
        
    }
 
    let adminE = await KitchenSignupSchema.findOne({email:req.body.email});
    if  (adminE!==null)
    {
        IsalreadyExist=true;
        ErrMsg.push({msg:"Email already exist",param:'email'});
        //ErrMsg.Email="Email already exist";
       
    }
     
    let adminP = await KitchenSignupSchema.findOne({phone_no:req.body.phone_no});
    if  (adminP!==null)
    {
        IsalreadyExist=true;
        ErrMsg.push({msg:"Phone already exist",param:'phone'});
        //ErrMsg.Phone="Phone already exist";
       
    }
    

    if (IsalreadyExist) {
        return res.status(200).json({ errors: ErrMsg });

               // return res.status(200).json({ errors: [{'msg': ErrMsg+ ' already exist in database,please use unique with group'}] });


    } else {



    let hashPassword = bcrypt.hashSync(req.body.password, rounds);

    try {
        admin = new KitchenSignupSchema({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            kitchen_name: req.body.kitchen_name,
            address:req.body.address,
            state: req.body.state,
            city: req.body.city,
            zipcode: req.body.zipcode,
            email: req.body.email,
            password: hashPassword,
            phone_no: req.body.phone_no,
            agreement_policy: req.body.agreement_policy,
        });


        await admin.save();


       
        //sending email from 
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dineout2018@gmail.com',
                pass: 'dineout@2018'
            }
        });
        let href = `http://localhost:3001/kitchen/verifyEmail/?id=${admin._id}`

        // sending mail to 
        var mailOptions = {
            from: 'dineout2018@gmail.com',
            to: 'Syedhaq5511@gmail.com',// req.body.email
            subject: 'Sending Email using Node.js test mail',
           // text: 'That was easy node class Today!'


            //html for email

            html: `<!DOCTYPE html>
                            <html>
                            <head>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                            <style>
                            .card {
                                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                                max-width: 300px;  margin: auto;  text-align: center; font-family: arial;
                            }
                            
                            .title { color: grey;font-size: 18px;
                            }
                            
                            p {
                                border: none; outline: 0;
                                display: inline-block;padding: 8px;
                                color: white;  background-color: #000;text-align: center;
                                cursor: pointer;  width: 100%; font-size: 18px;
                            }
                            
                            button {
                                text-decoration: none;
                                font-size: 22px;
                                color: black;
                            }
                            
                            button:hover, a:hover {
                                opacity: 0.7;
                            }
                            </style>
                            </head>
                            <body>
                            
                            <h2 style="text-align:center">Welcome ${req.body.firstName}</h2>
                            
                            <div class="card">
                                <img src="https://www.w3schools.com/w3images/team2.jpg" alt="John" style="width:100%">
                                <h1>${req.body.firstName}</h1>
                                <p class="title">Thanku.</p>
                            
                                <button><a href=${href} active">Verify Email</a></button>
                            </div>
                            
                            </body>
                        </html>`

        };

        //sending email method or function
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                
                // this will capture if error comes in email sent 
                    errs = new CaptureErrorsSchema({
                    error: error,
                    errorRoute: 'KitchenSignup ',
                    errorMethod:'Transporter_email',
                    email: req.body.email,
                    kitchen_name:req.body.kitchen_name
                   
                   
                });
        
    
                errs.save();

            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        return res.status(200).send({ response: admin, 'route': 'https://yahoo.com','Msg': 'Successfully Created Master User' });


    } catch (error) {
        let str = `E11000 duplicate key error collection: test.masteradminsignups index`

     
            // This below code will capture error and store it to ERROR collection 

            if(error.code !==11000){
                
                errs = new CaptureErrorsSchema({
                    error: error,
                    errorRoute: 'KitchenSignup',
                    email: req.body.email,
                    kitchen_name:req.body.kitchen_name
                   
                   
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

}});





// Email verfy Kitchen Login 
// This Api we are using on kitchen login page to validate email on the fly.
// Post -localhost:3001/kitchen/KitchenEmailVerify


router.post('/KitchenEmailVerify',async (req, res, next) => {
console.log("=========",req.body,"-----")

    // Check if this user already exisits
    let admin = await KitchenSignupSchema.findOne({ email: req.body.email, status: true });
    if (admin == null) {

        return res.status(200).json({ errors:[{"msg": 'That admin dose not exisits! Or deactivated, Please check login details' }]});

    }
    
});



//logout kitchen - to delete token from server 
// this code is pending ,incomplete code , this has to delete token from server side 
// this url you will see at kitchen sign in page 

router.post('/KitchenSignInLogout',async (req, res, next) => {

    //console.log(req.body['x-access-token'],"--------",req.headers)
    //jwt.destroy(req.body['x-access-token'])

    return res.status(200).json({ errors:[{"msg": 'Logout sucessfuly' }]});
    
});



// Kitchen Login 
// This API will generate JWT token when on successful sign in 
// Post - localhost:3001/kitchen/KLogin



router.post('/KitchenLogin',CustomerSignInValidations,async (req, res, next) => {



    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    }


    // Check if this user already exisits
    let admin = await KitchenSignupSchema.findOne({ email: req.body.email, status: true });
    if (admin == null) {

        return res.status(200).json({ errors:[{"msg": 'That admin dose not exisits! Or deactivated, Please check login details' }]});

    }
    let compPassword = bcrypt.compareSync(req.body.password, admin.password)

    if (compPassword == false) {

        return res.status(200).json({ errors:[{"msg": 'Incorrect Password!! Or  Account deactivated, Please check login details' }]});

    } else {

        let adminId = admin._id
   
        try {
            let token = jwtSignin(req, res, next, { adminId: adminId,admin:admin })
           //console.log("----",token)
          //res.setHeader('Content-Type', 'text/plain');
          // return res.send({ auth: true, admin,token:token });
        } catch (err) {
            return next(err)
        }
    }
});




// This Route is for eemail verfication through email,and will update its status to true 
// Get - localhost:3001/kitchen/verifyEmail
router.get('/verifyEmail', async (req, res, next) => {


    // Check if this user already exisits
    if (req.query.id !== "") {
        try {

            let admin = await KitchenSignupSchema.findOneAndUpdate({ _id: req.query.id }, { status: true })


            res.status(200).send({ auth: true, admin });

        } catch (err) {
            return next(err)
        }
    } else {
        res.status(200).send({ "error": 'Something is missing.' });
    }


});






module.exports = router;