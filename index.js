require("dotenv").config();

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const UserStatus = require('./models/userStatus.js')
const ejsMate = require('ejs-mate');
const {isAdmin} = require('./middleware.js')
const methodOverride = require('method-override');
const asycnWrap = require('./utils/asyncWrap.js');
const asyncWrap = require("./utils/asyncWrap.js");
const { log } = require("console");

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'view'));

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.engine('ejs',ejsMate)
app.use(methodOverride('_method'));

async function main(){
    try{
        mongoose.connect(process.env.DB_URL);
        
    }catch(e){
        console.log(e);
    };
}
main().then(()=>{
    console.log("db connected");
})


// public routes

app.get('/',asyncWrap( async(req,res)=>{
    let Teams = await UserStatus.find({});
    let first = -1;
    let second =-1;
    let third =-1;
    let firstTeamCode='';
    let secondTeamCode='';
    let thirdTeamCode='';
    let firstTeamName ='';
    let secondTeamName ='';
    let thirdTeamName ='';
    for(const element of Teams){
        if(first < element.points){
         first = element.points;
         firstTeamCode = element.teamCode;
         firstTeamName = element.teamName;
        }  
    }

    for(const element of Teams){
        if(second < element.points && element.teamCode != firstTeamCode){
         second = element.points;
         secondTeamCode = element.teamCode;
         secondTeamName = element.teamName;
        }  
    }
    for(const element of Teams){
        if(third < element.points && element.teamCode != firstTeamCode && element.teamCode !=secondTeamCode){
         third = element.points;
         thirdTeamName = element.teamName;
        }  
    }

    let questionCode = 'saltdefault.png'


    res.render("webPages/index.ejs",{firstTeamName, secondTeamName, thirdTeamName,questionCode, Teams})
}))

app.post('/public/question', asyncWrap(async(req, res)=>{
    let Teams = await UserStatus.find({});
    let first = -1;
    let second =-1;
    let third =-1;
    let firstTeamCode='';
    let secondTeamCode='';
    let thirdTeamCode='';
    let firstTeamName ='';
    let secondTeamName ='';
    let thirdTeamName ='';
    for(const element of Teams){
        if(first < element.points){
         first = element.points;
         firstTeamCode = element.teamCode;
         firstTeamName = element.teamName;
        }  
    }

    for(const element of Teams){
        if(second < element.points && element.teamCode != firstTeamCode){
         second = element.points;
         secondTeamCode = element.teamCode;
         secondTeamName = element.teamName;
        }  
    }
    for(const element of Teams){
        if(third < element.points && element.teamCode != firstTeamCode && element.teamCode !=secondTeamCode){
         third = element.points;
         thirdTeamName = element.teamName;
        }  
    }


    let questionCode = "salt"+ req.body.questionCode+'.jpg';
    

    res.render("webPages/index.ejs",{firstTeamName, secondTeamName, thirdTeamName,questionCode, Teams})
}))

//anser form

app.get('/public/answerForm',(req,res)=>{
    res.render('webPages/answer.ejs')
})

// answer submit 
app.put('/public/answer', asyncWrap(async(req,res)=>{
    console.log('accept');
    let data = await UserStatus.findOne({teamCode:req.body.teamCode});
    console.log(data);
    if(!data || data.teamPass != req.body.teamPass){
        res.send("Team code or Team password is wrong");
    }else{
        data.answer = req.body.answer;
        let updatedData = await UserStatus.findOneAndUpdate({teamCode:req.body.teamCode},{...data});
        console.log(updatedData);
        res.redirect('/');
    }
    
}))

// check team details
app.post('/public/checkTeamDetails', asyncWrap(async (req,res)=>{
    let currTeam = await UserStatus.findOne({teamCode:req.body.teamCode});
    if(!currTeam)res.send("Enter valid team code");
    else res.render('webPages/checkTeamDetail.ejs',{currTeam});
}))


// Admin Route

// Entry in Admin page
    app.post('/admin',isAdmin,(req,res)=>{
        res.render("webPages/admin.ejs");
    })


// admin updatePoints form
app.post('/admin/updatePoints', isAdmin,(req,res)=>{
    res.render('webPages/adminUpdatePoints.ejs')
})


// admin create team form
app.post('/admin/createTeamForm', isAdmin,(req,res)=>{
    res.render('webPages/createTeam.ejs');
})

// admin show all team data
app.post('/admin/showAllTeam', isAdmin, asyncWrap(
    async(req,res)=>{
        let data = await UserStatus.find({});
        res.send(data);
    }
));

// admin delte data

app.delete('/admin/deleteTeam',isAdmin,asycnWrap(
    async(req,res)=>{
        let deletedTeam = await UserStatus.findOneAndDelete({teamCode:req.body.teamCode});
        res.redirect('/');
    }
));

//admin update points
app.patch('/admin/points', isAdmin, asyncWrap(async(req,res)=>{
        let teamCode = req.body.teamCode;
        let currTeamData = await UserStatus.findOne({teamCode:teamCode});
        currTeamData.points = currTeamData.points + Number(req.body.points);
        currTeamData.noOfQuestion += 1;
        await UserStatus.findByIdAndUpdate(currTeamData.id,{...currTeamData});
        let updatedData = await UserStatus.findOne({teamCode:teamCode});
        res.redirect('/');
}
));


//admin crete team
app.post('/admin/createTeam', isAdmin,asyncWrap(
    async (req,res)=>{
        let data = new UserStatus(req.body.userStatus);
        let savedata = await data.save();
        res.redirect('/');
    }
))

app.all('*',(req,res)=>{
    res.send("Error 404 page not found")
});

app.use((err,req,res,next)=>{
    res.send(err);
})


app.listen(8000,()=>{
    console.log('server started 8080');
})