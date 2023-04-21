const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Item = require('../models/item')
const authenticateUser = require('../middleware/authenticateUser')

/** POST:/products
 * 
 * Uses the body of the request to create a new item entry
 * in the database
 */
router.post(`/products`, authenticateUser, async(req, res) => {
    //Find The seller
    const u = await User.findOne(req.user).populate('items')

    if (!u){//If the user doesn't exist, we have a problem, let the requestor know
        res.send({message:"This user doesn't exist"})
        return
    }

    try {
        //Create the new Item
        let newItem = new Item({
            name: req.body.name,
            price: req.body.price,
            owner: u
        })

        //Ship the new item as the response
        res.send(newItem)

        //Push it to the user
        u.items.push(newItem)

        //Save everything
        await newItem.save()
        await u.save()
        
    } catch (error) {
        console.log(error)
        res.send({err:error})
    }
})

/** GET:/products
 * 
 * Returns all the products in the DB
 */
router.get(`/products`, async (req, res) => {
    //Find all the products and ship it to the user
    const result = await Item.find({})
    res.send(result)
})

/** POST:/products/buy
 * 
 * Checks to make sure that a sale can go through and if it can
 * it carries out the sale, then updates the database
 */
router.post(`/products/buy`,authenticateUser, async (req, res) => {
    try {
        //Find the item by the ID
        const item = await Item.findById(req.body.productID)

        //find our buyer
        const buyer = await User.findOne(req.user).populate('items')

        //Item has to exist
        if (!item){
            res.send({message:"Cannot find item"})
            return
        }

        //Buyer shouldn't already own the item
        if (buyer._id.equals( item.owner._id)){
            res.send({message:"You already own this item!"})
            return
        }
        //User must have enough balance
        if (item.price > buyer.balance){
            res.send("Insufficient funds!")
            return
        }

        //Grab the owner
        const owner = await User.findById(item.owner._id).populate('items')

        if (!owner){ //If we can't find the owner, we need to leave
            res.send({message:"Could not find user."})
            return
        }
        //Transfer ownership and exchange money
        item.owner = buyer._id
        buyer.balance -= item.price
        owner.balance += item.price
        buyer.items.push(item)
        owner.items.pop(item)

        //Save changes
        owner.save()
        item.save()
        buyer.save()

        //Keep the User in the loop
        res.send({message:'Transaction successful!'})
    } catch (error) {
        console.log("!!!!!!!!   Purchase err:    !!!!!!!!!\n"+ error)
        res.send({message: "Error in Purchasing..."})
    }

})

/**DELETE:/products/:id
 * 
 * Deletes the product with the given ID. 
 */
router.delete(`/products/:id`,authenticateUser, async(req, res) => {
    try {
        //Get the user
        const u = await User.findOne(req.user).populate('items')

        //Get the item
        const i = await Item.findById(req.params.id).populate('')
        
        if(!i){
            res.send({message: "Item couldn't be found"})
            return
        }

        if(i.owner.equals(u._id)){
            //Delete the item. 
            const result = await Item.deleteOne({_id:req.params.id})
            res.send(result)
        } else {
            res.send({message: "You are not authorized to perform this operation"})
        }
    } catch (error) {
        console.log(error)
        res.send({err: "Something went wrong"})
    }
    
    
})


module.exports = router