// Making the code even more compact and readable by implementing router.route()
// Router.route() --> Handles multiple HTTP verbs that are connected to the same route

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const controllerUsers = require("../controllers/users.js");

// SignUp Form and Create User
router.route("/signup")
    .get(controllerUsers.signUpForm)
    .post(wrapAsync(controllerUsers.signUp));

router.route("/login")
    .get(controllerUsers.logInForm)
    .post(saveRedirectUrl, 
    passport.authenticate("local", // passport provides an authenticate() function, passed as a route middleware to authenticate requests. local --> using direct credentials of the application itself
    { failureRedirect: "/login", // where to redirect in case of failure to login
    failureFlash: true}), // option where passport automatically calls flash message for error 
    controllerUsers.logIn);

router.get("/logout", controllerUsers.logOut);

module.exports = router;