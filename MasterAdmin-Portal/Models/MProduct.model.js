const mongoose = require('mongoose');
mongoose.set('debug', true)
mongoose.set('useCreateIndex', true);



const ProductSchema = mongoose.model('Products', new mongoose.Schema({


    kitchen_name: { type: String, maxlength: 25, required: true,trim:true },
    u_id: { type: Number, maxlength: 500, required: true,trim:true  },
    item_type: { type: String, maxlength: 25, required: true,trim:true  },
    serving_temp: { type: String, maxlength: 25, required: true,trim:true  },
    item_name: { type: String, required: true,trim:true  },
    recipe_with: { type: String,trim:true  },
    ingredients: { type: String, required: true,trim:true  },
    single_size: { type: String, required: true,trim:true  },
    double_size: { type: String, required: true,trim:true  },
    allergic_ingredients: { type: String, required: true,trim:true  },
    special_markings: { type: String, required: true,trim:true  },
    status:{type:Boolean,default:true},
    created_at: { type: Date, required: true, default: Date.now }



}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));

exports.ProductSchema = ProductSchema;