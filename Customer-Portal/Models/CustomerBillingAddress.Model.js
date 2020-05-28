const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerBillingAddressSchema = mongoose.model ('CustomerBillingAddress', new mongoose.Schema({



    email:{type:String,required:true,unique:true,trim:true},
    billing_address : {type:String},
    created_at: { type: Date, required: true, default: Date.now },



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerBillingAddressSchema = CustomerBillingAddressSchema;
