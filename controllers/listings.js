// Following MVC (Models, Views, Controllers) to re-structure files for database, front-end, and back-end into each folder respectively
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.homePage = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.newListingForm = (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner"); // nested populate --> populate path of reviews as well as path of author
    console.log(`${listing.location}, ${listing.country}`)
    let coordinate = await geocodingClient.forwardGeocode({
        query: `${listing.location}, ${listing.country}`,
        limit: 1 // limit the number of results(coordinates) returned
      })
        .send();
    console.log(coordinate.body);
    listing.geometry = coordinate.body.features[0].geometry;
    if(!listing) {
        req.flash("error", "The listing you searched for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // let {title, description, image, price, location, country} = req.body; // not using this syntax, instead storing all the data as "keys" of the object "listing" in new.ejs to make code more efficient
    // if(!req.body.listing) { // using JOI schema validation for server-side validation instead of "if" and mongoose validations
    //     next(new ExpressError(400, "Send valid data...")); // if user sends invalid data through url instead of form, i.e handling server-side error
    // };
    let coordinate = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1 // limit the number of results(coordinates) returned
      })
        .send();

    let url = req.file.path;
    let filename = req.file.filename; // req.file holds file related data from HTML form 
    let newListing = new Listing(req.body.listing); // req.body holds text fields related data from FORM
    newListing.owner = req.user._id; // saving id using req.user explicitly so person logged in does not have to enter their id when creating listing 
    newListing.image = {url, filename}; // upload image functionality
    console.log(coordinate.body);
    newListing.geometry = coordinate.body.features[0].geometry;
    await newListing.save();
    console.log(newListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "The listing you are trying to edit does not exist!");
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    // if(!req.body.listing) { // using JOI schema validation for server-side validation instead of "if" and mongoose validations
    //     next(new ExpressError(400, "Send valid data...")); // if user sends invalid data through url instead of form, i.e handling server-side error
    // };
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}) // using "spread" to deconstruct "listing" object into individual arguements

    if(typeof req.file !== "undefined") { // if req.file is undefined i.e no new img is uploaded by client, then keep original image
        let url = req.file.path;
        let filename = req.file.filename; 
        listing.image = {url, filename};
        await listing.save(); // saving listing again with data from req.file this time
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params; // listing of this ID triggers mongoose middleware which is passed in it as "listing" variable (refer to listing.js)
    await Listing.findByIdAndDelete(id); // Goes to listingSchema which also triggers mongoose middleware to delete reviews
    req.flash("success", " Listing Deleted Successfully!");
    res.redirect("/listings");
};