const express = require("express");
const app = express()
require("./src/db/conn");
const User = require("./src/models/user");
const Product = require("./src/models/product");
const cors = require("cors")
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(cors()); 

//api work start

// app.get("/",(req,res)=>{
//     res.send("hello world");
// })

const jwt = require("jsonwebtoken");
const jwtkey = "e-comm";

//register API
app.post("/register",async(req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    })
     await user.save().then((result)=>{
         res.status(201).send({message:"user register successfully",register:result,status:"1"});
     }).catch((e)=>{
        res.status(400).send({message:"user register failed",error:e,status:"0"});
     })
})

//login API
app.post("/login",async(req,res)=>{
   let user = await User.findOne(req.body)
   if(req.body.email && req.body.password){
       if(user){
        jwt.sign({user},jwtkey,{expiresIn:"2h"},(err,token)=>{
            // res.send(user,{auth:token})
            if(err){
                res.send({result:"No User Found",status:"0"})           
            }
            res.send({message:"Login SuccessFully",user:user,status:"1",token:token})
        })  
       }else{
        res.send({result:"No User Found",status:"0"})
       }
   }else{
       res.send({result:"No User Found",status:"0"})    
   }
})

//add product API
app.post("/addproduct",async(req,res)=>{
    let product = new Product(req.body);
    await product.save().then((result)=>{
        res.status(201).send({message:"Product Add SuccessFully",product:result});
    }).catch((error)=>{
        res.status(404).send({message:"product add unsuccessfully",error:error})
    })
})

//get product API
app.get("/getproduct",verifyToken,async(req,res)=>{ 
     await Product.find().then((result)=>{
         res.status(200).send({message:"Product List View",product:result})
    }).catch((error)=>{
        res.status(404).send({message:"No Product Found",product:error})
    })
})


//delete product
app.delete("/deleteproduct/:id",async(req,res)=>{   
     await Product.deleteOne({_id:req.params.id }).then((result)=>{
        res.status(200).send({message:"Product Deleted SuccessFully",product:result})
     }).catch((e)=>{
        res.status(400).send({message:"Product SuccessFully Not Deleted",error:e})
     })

})

//update product
app.get("/updateproduct/:id",async(req,res)=>{
 let result = await Product.findOne({_id:req.params.id});
 if(result){
    res.send(result)
 }else{
    res.send({result:"No record Found"})
 }

 app.put("/updateproduct/:id",async(req,res)=>{
    await Product.updateOne({_id:req.params.id},{$set:req.body},{new:true}).then((result)=>{
        res.status(200).send({message:"data updated successfully",data:result})
    }).catch((error)=>{
        res.status(400).send({message:"data not updated",data:error})
    })
 })
})

//search API
app.get("/searchproduct/:key",async(req,res)=>{
    await Product.find({
        "$or":[
            {category:{$regex:req.params.key}},
            {company:{$regex:req.params.key}}
        ]
    }).then((result)=>{
        res.status(200).send({message:"Search Product",data:result})
    }).catch((error)=>{
        res.status(400).send({message:"No Product",data:error})
    })
})


//middleware in jwt token varify
function verifyToken(req,res,next){
    let token = req.headers["authorization"];
    if(token){
        token = token.split(' ')[1];
        console.log(token)
        jwt.verify(token,jwtkey,(err,valid)=>{
            if(err){
                res.status(403).send({message:"please Provide valid Token",error:err})
            }else{
                next()
            }
        })
    }else{
        res.status(400).send({message:"please add token with hearders"})
    }

}

app.listen(port,()=>console.log(`port is running:${port}`));