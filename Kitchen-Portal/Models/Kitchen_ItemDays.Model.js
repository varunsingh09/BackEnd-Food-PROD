const mongoose = require("mongoose")
mongoose.set('debug',true)


const KitchenItemServingDays = mongoose.model ('ItemServingDays',new mongoose.Schema({

    kitchen_name: { type: String, maxlength: 25, required: true,trim:true },
    u_id: { type: Number, maxlength: 500, required: true,trim:true  },
    item_type: { type: String, maxlength: 25, required: true,trim:true },
    item_name: { type: String, required: true,trim:true  },
    serving_days : [{ "type" : String }],
    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now }





}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.KitchenItemServingDays = KitchenItemServingDays;