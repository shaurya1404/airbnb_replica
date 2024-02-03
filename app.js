// install package.json, express, ejs, mongoose
// NOTE: app.use() is used to load functions as middleware
if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); // to connect ejs files in views folder 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // Suppose same styling template is to be used on multiple ejs templates, ejs mate adds the template of one common boilerplate ejs to all other ejs templates
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo'); // The default server-side express-session storage, MemoryStore, is purposely not designed for a production environment, only development.
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local"); // to implement local authorization
const User = require("./models/user.js"); 

// Router objects are isolated "mini-applications" that can perform middleware and routing functions
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); // for POST and PUT requests, because in both these req you are sending data and asking the server to store that data (object), which is enclosed in the body (i.e. req.body)
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); // express.static() is a built-in mw func to serve static files to the server. Hence, telling the server to accept all static files from route thisDirectory/public
app.engine("ejs", ejsMate);

// const mongo_url = mongodb://127.0.0.1:27017/wanderlust
const atlasdb = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: atlasdb, // connecting mongo session store to db
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*60*60 // setting interval between session updates to 24 hrs i.e if no change is being made to the session, it is updated only after 24hrs
});
// NOTE: max lifetime of a session(and sessionID in cookies) is 14 days in mongo store session by default

store.on("error", (err) => { // if error arises in mongo session store
    console.log("ERROR IN MONGO SESSION STORE", err)
})

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // specifies the date object(in ms) after which the sessionID cookie expires - 7 days in this example i.e max lifetime of a session is 7 days 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // to prevent cross-scripting attacks (find out)
    }
};

app.listen(8080, (req, res) => {
    console.log("server is listening to port 8080");
});

app.use(session(sessionOptions));
app.use(flash()); // initialize flash() after express-sessions have been initialized as it uses cookies to display messages on the redirected web page
passport.use(new LocalStrategy(User.authenticate())); // to enable authenticate method(function) of model "User" in LocalStrategy

passport.serializeUser(User.serializeUser()); // to serialize (store credentials) users into the session (user stays logged in throughout the session)
passport.deserializeUser(User.deserializeUser()); // to deserialize (remove credentials) after session

app.use(passport.initialize()); // To use Passport in an Express application, configure it with the required passport.initialize() middleware.
app.use(passport.session()); // If your application uses persistent login sessions, passport.session() middleware must also be used.

app.use((req, res, next) => {
    res.locals.success = req.flash("success") // Storing req.flash("success") in a variable. Property to access variables ("success") in templates rendered with res.render
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // Storing req.user obj into variable to use in navbar. If req.user undefined, then user is not logged-in and vice versa
    next(); // use next() otherwise server stays stuck on the mw
});

// Express routers are a way to organize the Express application such thst the primary app.js file does not become bloated
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter); // set mergeParams: true in review.js to preserve value of req.params (:id in this case) from parent router to child router
app.use("/", userRouter);

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(atlasdb);
};

app.all("*", (req, res, next) => { // for all pages that are not defined (placing after all defined routes)
    next(new ExpressError(404, "Page Not Found!"));
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err);
    let { statusCode = 500, message = "Something went wrong..."} = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message); // from expressError.js
});