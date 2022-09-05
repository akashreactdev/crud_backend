const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    price:{
        type:Number,
    },
    category:{
        type:String
    },
    company:{
        type:String
    },  
    userId:{
        type:String
    },
})

const Product = new mongoose.model("product",productSchema);

module.exports = Product;