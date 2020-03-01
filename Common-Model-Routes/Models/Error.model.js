const mongoose = require ('mongoose');
mongoose.set('debug',true)
mongoose.set('useCreateIndex', true);


const CaptureErrorsSchema = mongoose.model ('ErrorsCaptured', new mongoose.Schema({


    error:{type:String,trim:true,required:true},
    errorRoute:{type:String,required:true,trim:true},
    email:{type:String,trim:true},
    kitchen_name:{type:String,trim:true},
    errorMethod:{type:String,trim:true},
    u_id:{type:String,trim:true},
    stripe_id:{type:String,trim:true},
    create_at : { type: Date, required: true, default: Date.now }
    
    

}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
    }
}));


exports.CaptureErrorsSchema = CaptureErrorsSchema;