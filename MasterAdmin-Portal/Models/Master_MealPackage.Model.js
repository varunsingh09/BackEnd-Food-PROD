const mongoose = require("mongoose")
mongoose.set('debug',true)


const MealPackages = mongoose.model ('MealPackage',new mongoose.Schema({

    package_name: { type: String, maxlength: 25, required: true,trim:true },
    Days : [{ "type" : String }],
    price_permeal : {type:String},
    discount_4days:{type: Number,trim:true},
    dicount_6days:{type:Number,trim:true},
    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now }



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.MealPackages = MealPackages;