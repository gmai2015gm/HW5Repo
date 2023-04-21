const User = require('../models/user')

async function authenticateUser(req,res,next){
    //Make sure there's actually a user
    if(!req.session.user_id){
        console.log("This page requires authentication")
        res.send({message:"This page requires authentication"})
        return
    }
    //Find the user we're looking for
    req.user = await User.findById(req.session.user_id)

    //Move along
    next()
}

module.exports= authenticateUser