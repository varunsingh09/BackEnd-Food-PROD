const mongoose = require("mongoose")
mongoose.set('debug',true)


const MealPackagesSchema = mongoose.model ('MealPackage',new mongoose.Schema({



    package_type : { type: String, maxlength: 25, required: true,trim:true,lowercase:true },
    days : { type :Number, maxlength: 1, required: true,trim:true },
    price_perday : { type :Number, maxlength:5 , required: true,trim:true },
    total_price :{ type :Number, required: true,trim:true },
    stripe_plan_id :{ type :String, maxlength:20 , required: true,trim:true },
    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now },


}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.MealPackagesSchema = MealPackagesSchema;
