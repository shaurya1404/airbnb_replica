// Using express.Router() to restructure and encapsulate all "reviews" routes into a "mini-app" file
// Router is a module that loads middleware functions in it, defines some routes, and mounts the router module on a path in the main app.
const express = require("express");
const router = express.Router({mergeParams: true}); // to receive req.params value from parent router (app.js)
const wrapAsync = require("../utils/wrapAsync.js"); // go back to parent directory instead of current directory (unlike app.js) 
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");
const controllerReviews = require("../controllers/reviews.js")

//Review Form
router.get("/form", wrapAsync(controllerReviews.createReviewForm));

//Review Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(controllerReviews.postReview));

//Review Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(controllerReviews.destroyReview));

module.exports = router;