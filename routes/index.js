var express = require('express');
var router = express.Router();
var usermodel = require('../database/usermodel')
var postmodel = require('../database/postmodel')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var cookie = require('cookie');
// const { default: mongoose } = require('mongoose');
// const { log } = require('debug/src/browser');

const upload = require('../utils/multer');



/* landing page route */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/profile/pfp', validateuser, function (req, res, next) {
  res.render("pfp")
});
router.post('/upload',upload.single("profilePicture"), validateuser, async function (req, res, next) {
  let user =  await usermodel.findOne({email: req.user.email})
 user.pfp = req.file.filename;
 await user.save();
res.redirect("/profile")

});

router.post('/post',validateuser , async function (req, res, next) {

let user =  await usermodel.findOne({email: req.user.email});

let posts =  await postmodel.create({
user: user._id,
content: req.body.content

})
user.posts.push(posts._id)
await user.save();


res.redirect("/profile")
  
});

//protected route  creation
function validateuser(req, res, next) {
  // if (!req.cookies.token) {
  //   res.send("Please log in first");
  // } else {
  //   jwt.verify(req.cookies.token, "secret", (err, result) => {
  //     if (err) {
  //       res.send("Please log in first");
  //     } else {
  //       req.user = result; // Storing decoded token data in the request for later use
  //  console.log(result);
  //       next();
  //     }
  //   });
  // }
let token = req.cookies.token
  if(token === "") res.send("login kar na lawde ")
    else {
let data =  jwt.verify(token, "secret");
req.user = data;

}
  next();
}

//register page route 
router.get('/register', function (req, res, next) {

  res.render('register');
}

);
//deletepost page route 
//mg mana ku kali
router.get('/deletepost/:id', validateuser, async function (req, res, next) {

 
   const deletepost =  await postmodel.findOneAndDelete({_id: req.params.id});
   console.log(deletepost);
   
  
    res.redirect("/profile")
});


//like

router.get('/like/:id', validateuser,async function (req, res, next) {
  let post =  await postmodel.findOne({_id: req.params.id}).populate("user");

  if(post.likes.indexOf(req.user.userid)=== -1){
    post.likes.push(req.user.userid)
  }else{
   post.likes.splice( post.likes.indexOf(req.user.userid),1)
  }

 await post.save();
 res.redirect("/profile")

});

//edit
router.get('/editpost/:id', validateuser,async function (req, res, next) {
  let post =  await postmodel.findOne({_id: req.params.id}).populate("user");

  res.render("edit",{post})
});
router.post('/update/:uid', validateuser,async function (req, res, next) {
let post = await postmodel.findOneAndUpdate({_id: req.params.uid},{content: req.body.content})

  res.redirect("/profile")
});





router.get('/login', function (req, res, next) {

  res.render('login');
});
router.post('/login1', async function (req, res, next) {
    let { email, password } = req.body;

    try {
        let user = await usermodel.findOne({ email });
        if (!user) return res.status(500).send('User not found');

        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                // Generate JWT token
                let token = jwt.sign({ email: email }, "secret");

                // Set the cookie containing the token
                res.cookie('token', token, { httpOnly: true });

                // Redirect to profile page
                res.redirect('/profile');
            } else {
                res.status(401).send("Invalid password");
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//profile page
router.get('/profile', validateuser , async function(req,res,next){
 
  console.log(req.body.email);

let user =  await usermodel.findOne({email: req.user.email}).populate('posts')


  res.render('profile' , {user});
})

//logout
router.get('/logout',function(req,res,next){
    res.cookie("token","");
    
    res.redirect('/login')
})
//create user in database 
router.post('/register1', async function (req, res, next) {

  //data destructuring here so u do not have to write req.body.lawdalasun every time 
  let { email, password, name, username, age } = req.body;
  
  //to find the already exsisting user 
  const user = await usermodel.findOne({ email });
  if (user) return res.status(500).send("user already exsist");

  //if there is no already register user then create a new user in the database
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      const newuser = await usermodel.create({
        email: email,
        password: hash,//putting the encrypted password as(hash)
        name: name,
        username: username,
        age: age
      });
      //show the new user in backend terminal
      console.log(newuser);

      //generating token and sending cookie for new user to frontend;
      let token = jwt.sign({ email: email , userid: user}, "secret");
      console.log(token);
      res.cookie(token)
      res.redirect('/profile')

    });
  })

});

module.exports = router;
