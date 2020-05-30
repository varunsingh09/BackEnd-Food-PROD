const mongoose = require ('mongoose');
mongoose.set('debug',true)
// mongoose.set('useCreateIndex', true);


const CustomerPlanSchema = mongoose.model ('CustomerActivePlan', new mongoose.Schema({



    email:{type:String,required:true,unique:true,trim:true},
    stripe_customer_id:{type:String,required:true,trim:true},
    stripe_subscription_id:{type:String,required:true,trim:true},
    package_type : { type: String, maxlength: 25, required: true,trim:true,lowercase:true },

    plates:{ type :Number, maxlength:2,trim:true },
    price_perplate : { type :Number, maxlength:5 , required: true,trim:true },
    total_price :{ type :Number, maxlength:5, required: true,trim:true },
    stripe_plan_id :{ type :String, maxlength:20 , required: true,trim:true },
    stripe_product_id : { type :String, maxlength:20 , required: true,trim:true },
    status:{type:Boolean,default:true},
    status_reason:{type:String,default:'', maxlength:50 , trim:true },
    created_at: { type: Date, required: true, default: Date.now },



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.CustomerPlanSchema = CustomerPlanSchema;
