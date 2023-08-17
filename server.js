const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyparser = require("body-parser")
const encrypt = require("mongoose-encryption")

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyparser.urlencoded({
    extended:true
}))


mongoose.connect("mongodb+srv://onstopsolution:90907878@cluster0.08v6sws.mongodb.net/onstopsolution?retryWrites=true&w=majority")
.then(()=>console.log("Connected"))
.catch((error)=>console.log(error));





const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    name : String,
    surname : String,
    userType: String
})


// const secret = "thisissecreate";
// userSchema.plugin(encrypt, { 
//     secret: secret, 
//     encryptedFields: ["password"]
//   });


const User = new mongoose.model("User", userSchema);


const foodSchema = new mongoose.Schema({
  donorName: String,
  foodName: String,
  foodType: String,
  expiryDate: Date,
  quantity: Number,
  donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  cityName: String,
  location: String
  
});

const Food = mongoose.model("Food", foodSchema);






app.get('/', function(req, res){
    res.render("home")
})

app.get('/register', function(req, res){
    res.render("register")
})

app.get('/login', function(req, res){
    res.render("login")
})

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password : req.body.password,
        name : req.body.name,
        surname : req.body.surname,
        userType: req.body.userType
    });
  
    newUser.save()
      .then(() => {
        res.render("login")
      })
      .catch((err) => {
        console.log(err);
      });
  })


  // app.post("/login", function(req, res){
  //   const email = req.body.username;
  //   const password = req.body.password;

  //   User.findOne({email: email, password: password}).exec()
  //     .then((user) => {
  //       if (!user) {
  //         res.send("Invalid login credentials");
  //       } else {
  //         if (user.userType === "volunteer") {
  //            res.render("volunteer", { user: user})
  //         } else if (user.userType === "hotel") {
  //           res.render("hotel")
  //         } else if (user.userType === "donor") {
  //           res.render("donor", { user: user })
  //         } else if (user.userType === "customer") {
  //           res.render("customer", { user: user })
  //         } else if (user.userType === "animal-shelter") {
  //           res.render("animal-shelter", { user: user })
  //         }
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // })






  app.post("/login", function(req, res){
    const email = req.body.username;
    const password = req.body.password;
  
    User.findOne({email: email, password: password}).exec()
      .then((user) => {
        if (!user) {
          res.send("Invalid login credentials");
        } else {
          if (user.userType === "organization") {
            res.render("organization", { user: user});
          } else if (user.userType === "hotel") {
            res.render("hotel");
          } else if (user.userType === "donor") {
            res.render("donor", { user: user });
          } else if (user.userType === "customer") {
            res.render("customer", { user: user });
          } else if (user.userType === "animal-shelter") {
            res.render("animal-shelter", { user: user });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  });





  app.get('/donor', function(req, res){
    Food.find({ donor: req.user._id }).populate('donor').then((foods) => {
        res.render("donor", { user: req.user, foods: foods });
    }).catch((err) => {
        console.log(err);
    });
})


















  app.get('/addfood', function(req, res){
    const success = req.query.success;
    res.render("addfood", { success: success });
  })
  


app.post("/addfood", function(req, res){
  const newFood = new Food({
    donorName : req.body.donorName,
    foodName: req.body.foodName,
    foodType : req.body.foodType,
    expiryData: req.body.expiryDate,
    quantity: req.body.quantity,
    cityName : req.body.citynm,
    location: req.body.location
    
  });

  newFood.save()
    .then(() => {
      res.redirect("/addfood?success=1");
    })
    .catch((err) => {
      console.log(err);
    });
})


// Fetching Food Detail to the Volunteers page 
app.get('/availableFood', function(req, res){
  Food.find().then((foods) => {
    res.render("availableFood", {food: foods});
  }).catch((err) => {
    console.log(err);
  });
})

// Getting Data of New Needy People 
app.get('/availableFood', function(req, res){
  res.render("availableFood");
})

// Fetching data of Needy People 
app.get('/sellunsoldfood', function(req, res){
  res.render("sellunsoldfood");
})


app.get('/hotel', function(req, res){
  res.render("hotel");
})

// creating schema to get selling food detail and storing into the database


const foodToSellSchema = new mongoose.Schema({
  hotelName: String,
  foodName: String,
  foodType: String,
  quantity: Number,
  location: String,
  discount: Number
});

const FoodToSell = mongoose.model("FoodToSell", foodToSellSchema);


app.post("/sellunsoldfood",function(req, res){
  const newFoodToSell = new FoodToSell({
    hotelName : req.body.hotelName,
    foodName: req.body.foodName,
    foodType : req.body.foodType,
    quantity: req.body.quantity,
    location: req.body.location,
    discount: req.body.discount
   
  });

  newFoodToSell.save()
  .then(() => {
    res.render("sellunsoldfood", { success: true });
  })
  .catch((err) => {
    console.log(err);
    res.render("sellunsoldfood", { success: false });
  });
});







app.get('/customerfood', function(req, res){
  FoodToSell.find().then((foodtosells) => {
    res.render("customerfood", {fd: foodtosells});
  }).catch((err) => {
    console.log(err);
  });
})



const foodtoanimalSchema = new mongoose.Schema({
  hotelName: String,
  cityName: String,
  location: String
  
});

const FoodtoAnimal = mongoose.model("FoodtoAnimal", foodtoanimalSchema);

app.post("/hotel", function(req, res){
  const Animalfood= new FoodtoAnimal({
    hotelName : req.body.hotelnm,
    cityName: req.body.citynm,
    location: req.body.location
    
  });

  Animalfood.save()
    .then(() => {
      res.redirect("/hotel");
    })
    .catch((err) => {
      console.log(err);
    });
})


app.get('/seeanimalfood', function(req, res){
  FoodtoAnimal.find().then((foodtoanimals) => {
    res.render("seeanimalfood", {Animalfd: foodtoanimals});
  }).catch((err) => {
    console.log(err);
  });
})







app.listen(3000, function(){
    console.log("server is Running at: 3000");
})