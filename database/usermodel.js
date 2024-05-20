const mongoose =  require ('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/postmate")
.then(()=>{console.log('Connected to mongodb succesfully .✅')});


const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    pfp:{type: String ,
      default:"bor.png"
      

    },
    posts:[
      {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "posts"
      },
      
    ]
   
  });

module.exports = mongoose.model('user',userSchema)