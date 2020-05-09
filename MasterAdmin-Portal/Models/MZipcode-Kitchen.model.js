const mongoose = require("mongoose");
mongoose.set("debug", true);

const ZipcodeKitchensSchema = mongoose.model(
    "ZipcodeKitchens",
    new mongoose.Schema(
        {
            state: {
                type: String,
                maxlength: 10,
                required: true,
                trim: true,
                lowercase: true,
            },
            zipcodes: [
                {
                    type: Number,
                    required: true,
                    maxlength: 5,
                    min: 5,
                    trim: true,
                    lowercase: true,
                },
            ],
            kitchen_names: [
                { type: String, required: true, trim: true, lowercase: true },
            ],
            created_at: { type: Date, required: true, default: Date.now },
        },
        {
            writeConcern: {
                w: "majority",
                j: true,
                wtimeout: 1000,
            },
        }
    )
);

exports.ZipcodeKitchensSchema = ZipcodeKitchensSchema;
