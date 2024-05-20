const mongoose =  require ('mongoose')


const postSchema = mongoose.Schema({
   
    user:[
      {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "user"
      }
    ],

    date:{
        type:Date,
        default: Date.now()
    },
    content:[{
        type:String
    }],
    likes:[{
        user: {type : mongoose.Schema.Types.ObjectId ,ref : "user"} ,
        date: {type:Date,default: Date.now()}
    }]
  });

module.exports = mongoose.model('posts',postSchema)