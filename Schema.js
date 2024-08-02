const Joi = require('joi');

const listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().uri().required(),
    price: Joi.number().optional(),
    location: Joi.string().required(),
    country: Joi.string().required()
});

const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().required()
});

module.exports = { listingSchema, reviewSchema };
