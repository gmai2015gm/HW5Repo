const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Item = require('../models/item')
const bcrypt = require('bcrypt')
const authenticateUser = require('../middleware/authenticateUser')
//const session = require('express-session')

//router.use(authenticateUser)

/** POST:/users
 * 
 * Used to add users to the database using the given body
 */
router.post('/users/register',async (req,res)=>{
    //Make the new user
    const u = new User(req.body)
    u.items = [] //Initialize the items array

    try{
        //Run the password through bcrypt
        u.password = await bcrypt.hash(u.password,8)
        const result = await u.save()
        
        //Stick all the pertinant info into the output object
        let output = {}

        output.id = result._id
        output.name = result.name
        output.user_name = result.user_name
        output.balance = result.balance

        //Ship it to the user
        res.send(output)
    } catch(err) {
        console.log("!!!!!!!!   Register err:    !!!!!!!!!\n"+ err)
        res.send({message:"Register Error: Please try again"})
    }
    
})

/**
 * POST:/users/login
 * 
 * Logs in the user. 
 */

router.post('/users/login', async(req, res)=>{
    try {
        //Find the user
        const user = await User.findOne({user_name:req.body.user_name})
        if(!user){
            //If the user doesn't exist, we have a problem. So get out of there
            res.send({message: "Error logging in. Incorrect username/password"})
        }

        //See if the passwords match
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if(!isMatch){ //If they don't, we need to let them know
            res.send({message: "Error logging in. Incorrect username/password"})
        }

        //If we've made it this far, we can just add it to the session
        req.session.user_id = user._id
        res.send({message: "Successfully logged in. Welcome " + user.name})

    } catch (error) {
        console.log("!!!!!!!!   Login err:    !!!!!!!!!\n"+ error)
        res.send({message: "Error logging in."})
    }
    
})

/** GET:/users/me
 * 
 * Finds the user that is logged in and returns it to the requestor
 */
router.get('/users/me',authenticateUser,async(req,res)=>{
    //Grab the user
    const u = await User.findOne(req.user).populate('items')
    
    if (!u)//If the user doesn't exist, we have a problem, let the requestor know
        res.send({message:"This user doesn't exist"})
    else{
        //Bounce our important info to the output object
        let output = {}

        output.id = u._id
        output.name = u.name
        output.user_name = u.user_name
        output.balance = u.balance
        output.items = u.items

        //Ship the output out
        res.send(output)
    }
})

/** POST:/users/logout
 * 
 * Logs out the user that is currently logged in
 * 
 */
router.post('/users/logout', authenticateUser, async (req, res)=>{
    //Grab the user for later
    const u = await User.findOne(req.user)

    //Destroy the session and inform the user
    req.session.destroy(()=>{
        res.send({message:`Successfully logged out ${u.name}`})
    })
})

/** DELETE:/users/:userName
 * 
 * Finds the user by their username delete's the user and the items the user owns 
 */
router.delete('/users/me', authenticateUser,async(req,res)=>{
    //Find the user
    const u = await User.findOne(req.user).populate("items")

    if (!u){
        res.send({error:"Could not find user..."})
    }

    //Try to delete everything
    try {
        await Item.deleteMany({owner:u._id})
        await User.deleteOne(u)
        res.send({message:`Successfully deleted ${u.name}`})
        
        //If they got this far, they must be logged in, so we should probably log them out
        req.session.destroy()
    } catch (error) {
        res.send({error:"Error: Could not delete user"})
    }
})

/** GET:/summary
 * 
 * Returns all users and the lists of the items they own
 */
router.get(`/summary`, (req,res)=>{
    //Find all the users and their items arrays
    User.find({}).populate('items').exec((error,result)=>{
        if(error){
            res.send(error)
        }
        else{
            //Map it to avoid like the v attributes and things. 
            const allUsers = result.map(u=> {return{_id:u.id, name:u.name,email:u.email,items:u.items}})
            
            //Ship it to requestor
            res.send(allUsers)
        }
           
    })
})

module.exports = router