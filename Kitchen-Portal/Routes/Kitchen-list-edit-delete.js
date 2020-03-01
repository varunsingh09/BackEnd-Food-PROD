const express = require('express');
const router = express.Router();
const { KitchenSignupSchema } = require('./../../Kitchen-Portal/Models/KSignup-model')
//const { validateMeChecks } = require('./../middleware')
const { validationResult } = require("express-validator/check");
const { jwtSignin, jwtVerifyToken, validateMeChecks } = require('./../../middleware')
const {CaptureErrorsSchema} = require('./../../Common-Model-Routes/Models/Error.model')
//const { redisSetKey, client } = require('./../../redis')


// KITCHEN LIST
// This Route is to fetech all Registered KITCHENS list 
// GET- localhost:3001/Kitchen/AllKitchen_fromCache 

router.get('/AllKitchen_fromCache', async(req,res,next) => {
    


    try {
            
        let kitchen_count = await KitchenSignupSchema.find({}).count();

        let kitchen = await KitchenSignupSchema.find({},{'kitchen_name':1,'state':1,'city':1,'email':1,'status':1,'_id':0}).lean(true).skip(0).
        sort({"_id":-1}).limit(5);
    

             if(kitchen.length==0) 
             {res.status(200).send({"errors":"No Record Found in Database"})}
             else { res.status(200).send({'result': kitchen,"kitchen_count":kitchen_count})}

    } catch (error){


    }

})

module.exports = router;