const mongoose = require('mongoose');
mongoose.set('debug', true)

// this schema is for State and city 


const StateCitySchema = mongoose.model('Stateandcitys', new mongoose.Schema ({

    state:{type:String, maxlength:25,unique: true,trim:true},
    cityList:  [{   "type": String   }],
    
    create_at : { type: Date, required: true, default: Date.now }


}))

exports.StateCitySchema = StateCitySchema;

