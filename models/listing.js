const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },  // NOTE: default works only if value is undefined but not when its null (i.e left blank by client in front-end), thus using set
    price: Number,
    location: String,
    country: String,
    reviews: [{ // for one-to-many relation w/ reviews.js
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
          type: String, // Don't do `{ geometry: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number], // array for storing [long,lat]
          required: true
        }
      }
});

listingSchema.post("findOneAndDelete", async(listing) => { // DELETE route in app.js calls findByIdAndDelete which triggers the same mongoose middlewares as findOneAndDelete
    await Review.deleteMany({_id: {$in: listing.reviews}});
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;