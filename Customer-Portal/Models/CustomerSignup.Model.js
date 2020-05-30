const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerSignupSchema = mongoose.model ('CustomerSignup', new mongoose.Schema({


    firstName:{type:String, maxlength:25,required:true,trim:true,lowercase: true},
    lastName:{type:String, maxlength:25,required:true,trim:true,lowercase: true},
    email:{type:String,required:true,unique:true,trim:true},
    zipcode:{type:Number, required:true},
    password:{type:String,minlength:4,maxlength:250,required:true,trim:true},
    // device_type:{type:String, maxlength:10,required:true,trim:true,lowercase: true},
    stripe_customer_id:{type:String,required:true,trim:true},
    // isPaymentAvaiable : {type:Boolean,default:false},
    email_verify_status:{type:Boolean,default:false},
    account_status:{type:Boolean,default:true},
    create_at : { type: Date, required: true, default: Date.now }



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerSignupSchema = CustomerSignupSchema;
