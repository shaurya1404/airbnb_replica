const User = require("../models/user.js");

module.exports.signUpForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUp = async(req, res) => {
    try { // implementing try-catch instead of wrapAsync such that we use flash message to display error and user is redirected back to /signup page
    let { username, email, password } = req.body;
    let newUser = new User ({username, email})
    await User.register(newUser, password);
    req.login(newUser, (err) => { // callack function will only have parameter if error occurs
        if(err) { return next(err); }
        else { // if no error arises, perform next operations
            req.flash("success", "Logged in successful!")
            res.redirect("/listings");
        }
    });
    }
    catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup")
    }
};

module.exports.logInForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.logIn = async(req, res) => { // call function is called if passport mw approves sign in
    req.flash("success", "You have successfully been logged in!");
    if(res.locals.redirectUrl) {
        res.redirect(res.locals.redirectUrl); // redirecting to initial URL user was trying to access
    }
    else { res.redirect("/listings")}; // redirecting back to home page if user was trying to login directly itself
};

module.exports.logOut = (req, res, next) => {
    req.logout((err) => { // Passport method which deletes credentials of user from session, and takes parameter in callback function only if error occurs
        if(err) {
            return next(err); // goes to error handler middleware
        }
        else { // if no error arises, perform next operations
            req.flash("success", "Logged out successfully!")
            res.redirect("/listings");
        }
    }) 
};