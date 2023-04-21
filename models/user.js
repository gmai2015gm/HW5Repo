const mongoose = require('mongoose')

//Set up the schema as prescribed
const UserSchema = mongoose.Schema({
    name:{required:true,type:String},
    user_name:{required:true,type:String, unique : true},
    password:{required:true,type:String},
    balance: {type:Number, default:100}
})
UserSchema.virtual('items',{ //Here's our virtual field for the items array
    ref:'Item',
    localField:'_id',
    foreignField:'owner'
})
UserSchema.set('toJSON',{virtuals:true})
UserSchema.set('toObject',{virtuals:true})

//Make and send out the model
const User = mongoose.model("User",UserSchema,"users")
module.exports = User