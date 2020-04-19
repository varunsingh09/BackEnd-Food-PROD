const mongoose = require('mongoose');
mongoose.set('debug', true)

// This schema is creating master admin account in database collection [MasterAdminSignup]


const KitchenSignupSchema = mongoose.model('KitchenSignup', new mongoose.Schema ({

 
    kitchen_name:{type:String, maxlength:25,required:true,unique:true,trim:true,lowercase: true},
    address:{type:String, maxlength:100,required:true,trim:true,lowercase: true},
    state:{type:String, required:true},
    city:{type:String,required:true},
    zipcode:{type:Number, required:true},
    email:{type:String,required:true,unique:true,trim:true,lowercase: true},
    password:{type:String,minlength:4,maxlength:250,required:true,trim:true},
    contact_no:{type:Number,minlength:1,maxlength:10,required:true,unique:true,trim:true},
    agreement_policy:{type:String,required:true},
    status:{type:Number,default:false},
    create_at : { type: Date, required: true, default: Date.now }


}))

exports.KitchenSignupSchema = KitchenSignupSchema;