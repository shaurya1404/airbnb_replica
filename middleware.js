const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");

module.exports.validateListing = (req, res, next) => { // storing server-side validation schema (joi) middleware as variable and passing in create and update routes
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // extracting "details" object in error and mapping each element of details to details.message and joining via ","
        throw new ExpressError(404, errMsg);
    } 
    else next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    }
    else next();
};


module.exports.isLoggedIn = (req, res, next) => {
    console.log("passing through isLoggedIn", req.user); // "request" object stores user related data by use of express-session. shows user's credentials if logged in 
    if(!req.isAuthenticated()) { // Passport method which returns FALSE if user has not been authenticated i.e is logged in
        req.session.redirectUrl = req.originalUrl // adding functionality where user is returned back to the operation they clicked on after successful login
        // req object has originalUrl key which stores the URL the user is initially goin to. go to line 12
        req.flash("error", "You must logged in to create a listing!");
        return res.redirect("/login");
    }
    next(); // next called only IF isAuthenticated yields false
}

// however, after user logs in. Passport automatically resets req.session and req.session.redirectUrl becomes undefined
// thus, storing as a req.locals variable 
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
};

// creating middleware such that opertions like edit and delete can only be performed by owner of the listing
module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if(res.locals.currUser && listing.owner._id.equals(res.locals.currUser._id)) { // checking if currUser is defined as the user may not even be logged in
        return next()
    }
    req.flash("error", "You do not have permission to perform this action!");
    res.redirect(`/listings/${id}`);
};

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId)
    if(res.locals.currUser && review.author._id.equals(res.locals.currUser._id)) { // checking if currUser is defined as the user may not even be logged in
        return next()
    }
    req.flash("error", "You do not have permission to perform this action!");
    res.redirect(`/listings/${id}`);
};

