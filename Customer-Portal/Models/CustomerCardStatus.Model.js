const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerCardStatusSchema = mongoose.model ('CustomerCardStatus', new mongoose.Schema({



    email:{type:String,required:true,unique:true,trim:true},
    customer_stripe_id:{type:String,required:true,trim:true},
    stripe_payment_method_id:{type:String,required:true,trim:true},
    default : {type:Boolean,default:true},
    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now },



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerCardStatusSchema = CustomerCardStatusSchema;
