const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerDeliveryAddressSchema = mongoose.model ('CustomerDeliveryAddress', new mongoose.Schema({



    email:{type:String,required:true,trim:true},
    delivery_address : {type:String, required:true, maxlength:50, trim:true},
    city: { type:String, required:true, maxlength:20, trim:true },
    state : { type:String, required:true, maxlength:15,  trim:true },
    zipcode : { type:String, required:true, maxlength:6,  trim:true },
    address_type: { type:String, required:true, maxlength:15, trim:true },
    status : {type:Boolean, default:true},
    created_at: { type: Date, required: true, default: Date.now },



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerDeliveryAddressSchema = CustomerDeliveryAddressSchema;
