const mongoose = require('mongoose')

//Here's the schema which is made as prescribed
const ItemSchema = mongoose.Schema({
    name:{required:true, type:String},
    price:{required:true, type:Number},
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

//Heres the model
const Item = mongoose.model("Item", ItemSchema, "items")

//Send it to who needs it
module.exports = Item