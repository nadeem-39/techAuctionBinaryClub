const {Schema, default: mongoose} = require('mongoose');

const userStatus = new Schema({

    points:{
        type:Number,
        required:true
    },

    teamName:{
        type:String,
        required:true
    },

    teamCode:{
        type:String,
        required:true,
    },
    teamPass:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
    },
    noOfQuestion:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('UserStatus',userStatus);


