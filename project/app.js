var express   = require("express"),
app           = express(),
bodyParser    = require("body-parser"),
booking       = require("./models/book"),
methodOverride = require("method-override"),
mongoose      = require("mongoose"),
passport      = require("passport"),
LocalStrategy = require("passport-local"),
User          = require("./models/user")

mongoose.connect("mongodb://localhost/sotab");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret:"this is the secret page",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})

var hotelSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    price:Number
});
var Hotel = mongoose.model("Hotel",hotelSchema);

app.get("/",function(req,res){
    res.render("landing");
});

app.get("/hotels",function(req,res){
    Hotel.find({},function(err,allhotels){
        if(err){
            console.log(err);
        }else{
            res.render("index",{hotels:allhotels});
        }
    })
});

app.post("/hotels",function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var newHotel = {name:name,image:image,description:desc,price:price};
    Hotel.create(newHotel,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/hotels");
        }
    })
});

app.get("/hotels/new",function(req,res){
    res.render("new");
});

//show route
app.get("/hotels/:id",function(req,res){
    Hotel.findById(req.params.id,function(err,foundHotel){
        if(err){
            console.log(err);
        }else{
            res.render("show",{hotel:foundHotel});
        }
    });
});

//auth routes
app.get("/register",function(req,res){
    res.render("register");
});
//signup
app.post("/register",function(req,res){
    var newUser = new User({username:req.body.username,email:req.body.email,phoneno:req.body.phoneno});
    User.register(newUser, req.body.password,function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
         passport.authenticate("local")(req,res,function(){
            res.redirect("/hotels");
        });
    });
});
//login
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",
    {
        successRedirect:"/hotels",
        failureRedirect:"/login"
    }), function(req,res){       
});
//logout
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/hotels");
});

//edit
app.get("/hotels/:id/edit",function(req,res){
    Hotel.findById(req.params.id,function(err,foundHotel){
        if(err){
            console.log(err);
        }else{
            res.render("edit",{hotel:foundHotel});
        }
    });
});
//update
app.put("/hotels/:id",function(req,res){
    Hotel.findByIdAndUpdate(req.params.id,req.body.hotel,function(err,updatedHotel){
        if(err){
            res.redirect("/hotels");
        }else{
            res.redirect("/hotels/"+req.params.id);
        }
    })
});
//delete
app.delete("/hotels/:id",function(req,res){
    Hotel.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/hotels");
        }else{
            res.redirect("/hotels");
        }
    });
});

//booking
app.get("/hotels/:id/book", isLoggedIn, function(req,res){
    Hotel.findById(req.params.id,function(err,selectedhotel){
        if(err){
            console.log(err);
        }else{
            res.render("book",{hotel:selectedhotel});
        }
    }); 
});
//mybooking
app.get("/hotels/:id/mybookings",function(req,res){
        res.render("mybookings");
});

app.post("/hotels/:id/mybookings",function(req,res){
    var bking =new booking({username:req.body.name, noofrooms:req.body.noofroom, curdate:req.body.bdate, arrdate:req.body.adate, price:req.body.tprice});
    booking.create(bking,function(err,newlybooked){
        if(err){
            console.log(err);
        }else{
            res.render("mybookings");
        }
    }); 
});

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3080,function(){
    console.log("server started....");
});
