const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerSubscriptionsSchema = mongoose.model ('CustomerSubscriptions', new mongoose.Schema({



    email:{type:String,required:true,trim:true},
    stripe_customer_id:{type:String,required:true,trim:true},
    stripe_subscription_id:{type:String,required:true,trim:true},
    stripe_plan_id :{ type :String, maxlength:20 , required: true,trim:true },
    stripe_product_id : { type :String, maxlength:20 , required: true,trim:true },
    package_type : { type: String, maxlength: 25, required: true,trim:true,lowercase:true },
    plates : { type :Number, maxlength: 1, required: true,trim:true },
    free_plates :{ type :Number, maxlength:2,trim:true },
    freePlateCoupon_no :{ type :String, maxlength:10,trim:true },
    manually_added_free_plates:{ type :Number, maxlength:2,trim:true },
    total_plates_tobe_serverd:{ type :Number, maxlength:2,trim:true },
    stripe_dicount_code :{ type :String, maxlength:10,trim:true },
    discount_type :{type:String, trim:true},
    total_charged :{ type :Number, maxlength:5,trim:true },

    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now },



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerSubscriptionsSchema = CustomerSubscriptionsSchema;
