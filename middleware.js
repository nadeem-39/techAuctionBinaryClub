



module.exports.isAdmin = (req,res, next)=>{
    if(req.body.who!=process.env.ADMIN){
        res.send('You are not admin!')
    }else{
        next();
    }
}