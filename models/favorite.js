const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("mongoose-currency").loadType(mongoose);
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campsite",
        required: true
    }],
    _id: {
        type: String,
        required: true
    }
});

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;