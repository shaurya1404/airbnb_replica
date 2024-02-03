// Using express.Router() to restructure and encapsulate all "listings" routes into a "mini-app" file
// Router is a module that loads middleware functions in it, defines some routes, and mounts the router module on a path in the main app.
// Making the code even more compact and readable by implementing router.route()
// Router.route() --> Handles multiple HTTP verbs that are connected to the same route

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateListing ,isLoggedIn, isOwner } = require("../middleware.js"); // passing isAuthenticate as a middleware to check authentication on all pages
const controllerListings = require("../controllers/listings.js");
const multer  = require('multer'); // node.js middleware for handling multipart/form-data to accept both raw data and files (urlencoded only accepts raw)
const { storage } = require("../configCloud.js")
const upload = multer({ storage }); // multer parses files received from the HTML form and stores them in the cloudinary storage

//Index and Create Route 
router.route("/")
    .get(wrapAsync(controllerListings.homePage))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(controllerListings.createListing)); // file name in HTML passed as parameter in upload.single()

//New Route
router.get("/new", isLoggedIn , controllerListings.newListingForm);

//NOTE : New route should be placed BEFORE Show route as otherwise, app.js considers /new as a /:id and searches it as the word "new" as an "id" in the DB which yields error

// Show, Update, and Delete Route
router.route("/:id")
    .get(wrapAsync(controllerListings.showListing))
    .put(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(controllerListings.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(controllerListings.destroyListing));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(controllerListings.editListing));

module.exports = router; // exporting router module to app.js