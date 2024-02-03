// defining schema again using joi for server-side validation
const Joi = require("joi");

module.exports.listingSchema = Joi.object({ // listingSchema is an object which contains listing object which is required
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        price: Joi.string().required().min(0), // no negative values
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});


