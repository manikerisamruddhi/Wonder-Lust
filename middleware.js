const Listing=require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require('./Schema.js');
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listings!!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear the redirectUrl from the session after using it
    }
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(listing && !listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the Owner!!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body.listings);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(',');
        console.log(errMsg);
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body.review);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(',');
        console.log(errMsg);
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};


module.exports.isReviewAuthor=async (req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(review && !review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the author of this review!!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}