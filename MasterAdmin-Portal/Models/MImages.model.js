const mongoose = require('mongoose');
mongoose.set('debug', true)



const ImagesSchema = mongoose.model('product_images', new mongoose.Schema({
    filename:  {
    type: Array
  },
    product_id: {
        type: String,
        trim:true
    },

    kitchen_name: {
        type:String,
        trim:true,
        required:true
    },

    created_at: { type: Date, required: true, default: Date.now }

}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}
));


exports.ImagesSchema = ImagesSchema;