// Following MVC (Models, Views, Controllers) to re-structure files for database, front-end, and back-end into each folder respectively
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReviewForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/review.ejs", { listing });
};

module.exports.postReview = async(req, res) => {
    let { id } = req.params;
    let { review } = req.body;
    let listing = await Listing.findById(id);
    let newReview = new Review(review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!")
    console.log("new review saved successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async(req, res, next) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // $pull --> operator that removes elements from an existing array that match the condition
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted Successfully!")
    res.redirect(`/listings/${id}`);
};